import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';

export const Terminal: React.FC = () => {
  const [commands, setCommands] = useState<string[]>(['npm run dev']);
  const [currentCommand, setCurrentCommand] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const commandsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    commandsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commands]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setCommands([...commands, currentCommand]);
      setCurrentCommand('');
    }
  };

  return (
    <div className="bg-gray-900 border-t border-gray-700 flex flex-col">
      <div className="flex items-center p-2 border-b border-gray-700">
        <TerminalIcon size={16} className="mr-2 text-gray-400" />
        <span className="text-sm text-gray-400">Terminal</span>
      </div>
      <div className="p-2 font-mono text-sm text-gray-300 overflow-y-auto flex-1">
        {commands.map((cmd, i) => (
          <div key={i} className="mb-1">
            <span className="text-green-500">➜</span> {cmd}
          </div>
        ))}
        <div className="flex items-center" onClick={() => inputRef.current?.focus()}>
          <span className="text-green-500 mr-2">➜</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent outline-none flex-1"
            placeholder="Enter command..."
          />
        </div>
        <div ref={commandsEndRef} />
      </div>
    </div>
  );
};