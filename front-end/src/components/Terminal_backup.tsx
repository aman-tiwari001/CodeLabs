import React, { useRef, useEffect, useState } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import { Terminal } from 'xterm';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import useSocketStore from '../store/socketStore';

export const CodeTerminal: React.FC = () => {
	const terminalRef = useRef<HTMLDivElement>(null);
	const [currentCommand, setCurrentCommand] = useState('');
	const [isCommandExecuting, setIsCommandExecuting] = useState(false);
	const [isWaitingForPrompt, setIsWaitingForPrompt] = useState(false);
	const termRef = useRef<Terminal | null>(null);
	const fitAddonRef = useRef<FitAddon | null>(null);

	const socket = useSocketStore((state: any) => state.socket);
	useEffect(() => {
		if (!socket) return;
		const term = new Terminal({
			cursorBlink: true,
			fontSize: 14,
			theme: {
				background: '#000000',
				foreground: '#ffffff',
				cursor: '#ffffff',
			},
			lineHeight: 1.2,
			cols: 80,
			rows: 24,
			scrollback: 1000,
			fastScrollModifier: 'shift',
			convertEol: true,
		});

		const fitAddon = new FitAddon();
		const webLinksAddon = new WebLinksAddon();
		term.loadAddon(fitAddon);
		term.loadAddon(webLinksAddon);

		termRef.current = term;
		fitAddonRef.current = fitAddon;
		if (terminalRef.current) {
			term.open(terminalRef.current);
			fitAddon.fit();
			// Focus the terminal to ensure it can receive input
			term.focus();
		}

		// Handle window resize
		const handleResize = () => {
			if (fitAddon) {
				fitAddon.fit();
			}
		};
		window.addEventListener('resize', handleResize); // Handle socket events
		const handleCommandOutput = (output: string) => {
			if (output) {
				term.write(output);
			}
			// Reset executing state when output contains a prompt or error
			if (output.includes('$ ') || output.includes('Error:')) {
				setIsCommandExecuting(false);
			}
		};

		// Remove any existing listeners to prevent duplicates
		socket.off('command-output', handleCommandOutput);
		socket.on('command-output', handleCommandOutput); // Handle terminal input
		term.onData((data) => {
			// Use functional updates to avoid stale closures
			setIsCommandExecuting((prevExecuting) => {
				if (prevExecuting) {
					// If a command is executing, only allow Ctrl+C
					if (data === '\x03') {
						// Ctrl+C
						socket.emit('execute-command', '\x03');
						setCurrentCommand('');
						return false; // Stop executing
					}
					return true; // Keep executing
				}

				if (data === '\r') {
					// Enter key
					setCurrentCommand((prevCommand) => {
						if (prevCommand.trim()) {
							// Send command to server, don't echo locally
							socket.emit('execute-command', prevCommand.trim());
							setTimeout(() => setIsCommandExecuting(true), 0);
							return '';
						} else {
							// Empty command, send to server to get new prompt
							socket.emit('execute-command', '');
						}
						return '';
					});
				} else if (data === '\u007F') {
					// Backspace
					setCurrentCommand((prevCommand) => {
						if (prevCommand.length > 0) {
							term.write('\b \b');
							return prevCommand.slice(0, -1);
						}
						return prevCommand;
					});
				} else if (data === '\x03') {
					// Ctrl+C
					setCurrentCommand('');
					socket.emit('execute-command', '\x03');
				} else if (data >= ' ' || data === '\t') {
					// Printable characters and tab - only echo locally for immediate feedback
					setCurrentCommand((prevCommand) => prevCommand + data);
					term.write(data);
				}

				return prevExecuting;
			});
		});

		return () => {
			window.removeEventListener('resize', handleResize);
			socket.off('command-output', handleCommandOutput);
			term.dispose();
		};
	}, [socket]); // Only depend on socket

	// Handle container resize
	useEffect(() => {
		const resizeObserver = new ResizeObserver(() => {
			if (fitAddonRef.current) {
				fitAddonRef.current.fit();
			}
		});

		if (terminalRef.current) {
			resizeObserver.observe(terminalRef.current);
		}

		return () => {
			resizeObserver.disconnect();
		};
	}, []);

	return (
		<div className='w-full h-full bg-black flex flex-col'>
			<div className='flex items-center gap-2 px-3 py-2 bg-gray-800 border-b border-gray-700'>
				<TerminalIcon size={16} className='text-white' />
				<span className='text-white font-medium text-sm'>TERMINAL</span>
			</div>
			<div
				ref={terminalRef}
				className='flex-1 p-2 bg-black overflow-hidden'
				style={{ minHeight: '300px' }}
			/>
		</div>
	);
};
