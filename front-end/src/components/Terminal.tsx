import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import { Terminal } from 'xterm';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import useSocketStore from '../store/socketStore';

export const CodeTerminal: React.FC = () => {
	// const [currentCommand, setCurrentCommand] = useState('');
	const terminalRef = useRef<HTMLDivElement>(null);

	const socket = useSocketStore((state) => state.socket);

	useEffect(() => {
		const term = new Terminal({
			cursorBlink: true,
			fontSize: 17,
			theme: {
				background: '#000000',
				foreground: '#ffffff',
			},
			lineHeight: 1.2,
		});
		const fitAddon = new FitAddon();
		const webLinksAddon = new WebLinksAddon();
		term.loadAddon(fitAddon);
		term.loadAddon(webLinksAddon);

		term.open(terminalRef.current);
		fitAddon.fit();
		term.write('>_ ');
		let currentCommand = '';
		term.onData((data) => {
			console.log('term ', data);
			if (data !== '\r' && data !== '\u007F') currentCommand += data;
			term.write(data);
			if (data === '\r') {
				term.write('\n');
				console.log('currentCommand', currentCommand);
				socket.emit('execute-command', currentCommand, (res: string) => {
					term.writeln(res.toString());
					currentCommand = '';
					term.write('>_ ');
				});
			} else if (data === '\u007F') {
				term.write('\b \b');
			}
		});

		return () => {
			term.dispose();
		};
	}, [socket]);

	return (
		<div ref={terminalRef} className='w-full h-full py-4 px-1 bg-black'>
			<h2 className='text-white flex gap-1 mb-2 border-b rounded-none pb-1 pl-1 font-semibold'>
				{' '}
				<TerminalIcon /> TERMINAL
			</h2>
		</div>
	);
};
