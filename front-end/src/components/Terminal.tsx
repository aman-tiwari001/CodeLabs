import React, { useRef, useEffect, useState } from "react";
import { Terminal as TerminalIcon } from "lucide-react";
import { Terminal } from "xterm";
import { WebLinksAddon } from "xterm-addon-web-links";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import useSocketStore from "../store/socketStore";

interface Props {
  refreshProjectStructure: () => void;
}

export const CodeTerminal: React.FC<Props> = ({ refreshProjectStructure }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isCommandExecuting, setIsCommandExecuting] = useState(false);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const commandBufferRef = useRef<string>("");

  const socket = useSocketStore((state: any) => state.socket);

  useEffect(() => {
    if (!socket) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      theme: {
        background: "#000000",
        foreground: "#ffffff",
        cursor: "#ffffff",
      },
      lineHeight: 1.2,
      cols: 80,
      rows: 24,
      scrollback: 1000,
      fastScrollModifier: "shift",
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
    window.addEventListener("resize", handleResize); // Handle socket events
    const handleCommandOutput = (output: string) => {
      term.write(output);
      // Reset executing state when we see a new prompt
      if (output.includes("$ ")) {
        setIsCommandExecuting(false);
      }
    };
    // Remove any existing listeners and add new one
    socket.off("command-output");
    socket.on("command-output", handleCommandOutput);
    // Handle terminal input
    term.onData((data) => {
      // Handle Ctrl+C - always allow this
      if (data === "\x03") {
        socket.emit("execute-command", "\x03");
        setIsCommandExecuting(false);
        commandBufferRef.current = "";
        return;
      }

      // Block other input during command execution
      if (isCommandExecuting) {
        return;
      }

      if (data === "\r") {
        // Enter key - execute command
        const command = commandBufferRef.current.trim();
        term.write("\r\n"); // Move to next line

        console.log("Executing command:", command);

        if (command) {
          setIsCommandExecuting(true);
          socket.emit("execute-command", command, () => {
            refreshProjectStructure();
          });
        } else {
          socket.emit("execute-command", "");
        }

        commandBufferRef.current = "";
      } else if (data === "\u007F") {
        // Backspace
        if (commandBufferRef.current.length > 0) {
          commandBufferRef.current = commandBufferRef.current.slice(0, -1);
          term.write("\b \b"); // Erase character visually
        }
      } else if (data >= " " || data === "\t") {
        // Printable characters and tab
        commandBufferRef.current += data;
        term.write(data);
      }
    });
    return () => {
      window.removeEventListener("resize", handleResize);
      socket.off("command-output");
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
    <div className="w-full h-full bg-black flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border-b border-gray-700">
        <TerminalIcon size={16} className="text-white" />
        <span className="text-white font-medium text-sm">TERMINAL</span>
      </div>
      <div
        ref={terminalRef}
        className="flex-1 p-2 bg-black overflow-hidden"
        style={{ minHeight: "300px" }}
      />
    </div>
  );
};
