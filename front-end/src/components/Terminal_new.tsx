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
	const termRef = useRef<Terminal | null>(null);
	const fitAddonRef = useRef<FitAddon | null>(null);
	const commandBufferRef = useRef<string>('');

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
			term.focus();
		}

		// Handle window resize
		const handleResize = () => {
			if (fitAddon) {
				fitAddon.fit();
			}
		};
		window.addEventListener('resize', handleResize);

		// Handle socket events - SINGLE listener
		const handleCommandOutput = (output: string) => {
			term.write(output);
			// Reset command executing state when we see a prompt
			if (output.endsWith('$ ')) {
				setIsCommandExecuting(false);
			}
		};

		socket.off('command-output', handleCommandOutput);
		socket.on('command-output', handleCommandOutput);

		// Handle terminal input
		term.onData((data) => {
			if (isCommandExecuting) {
				// Only allow Ctrl+C during command execution
				if (data === '\x03') {
					socket.emit('execute-command', '\x03');
					setIsCommandExecuting(false);
					commandBufferRef.current = '';
					setCurrentCommand('');
				}
				return;
			}

			if (data === '\r') {
				// Enter key pressed
				const command = commandBufferRef.current.trim();
				if (command) {
					setIsCommandExecuting(true);
					socket.emit('execute-command', command);
				} else {
					socket.emit('execute-command', '');
				}
				commandBufferRef.current = '';
				setCurrentCommand('');
			} else if (data === '\u007F') {
				// Backspace
				if (commandBufferRef.current.length > 0) {
					commandBufferRef.current = commandBufferRef.current.slice(0, -1);
					setCurrentCommand(commandBufferRef.current);
					term.write('\b \b');
				}
			} else if (data === '\x03') {
				// Ctrl+C
				commandBufferRef.current = '';
				setCurrentCommand('');
				term.write('^C\r\n');
			} else if (data >= ' ' || data === '\t') {
				// Printable characters
				commandBufferRef.current += data;
				setCurrentCommand(commandBufferRef.current);
				term.write(data);
			}
		});

		return () => {
			window.removeEventListener('resize', handleResize);
			socket.off('command-output', handleCommandOutput);
			term.dispose();
		};
	}, [socket]);

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
