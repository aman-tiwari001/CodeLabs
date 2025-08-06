import Docker from "dockerode";
import path from "path";

const docker = new Docker();

const ALLOWED_COMMANDS = [
  "npm",
  "npx",
  "tsc",
  "git",
  "node",
  "ls",
  "cd",
  "mkdir",
  "rm",
  "rmdir",
  "touch",
  "cp",
  "cat",
  "clear",
  "pwd",
  "echo",
  "head",
  "tail",
  "history",
];

// Validate command
export function validateCommand(cmd: string) {
  const trimmedCmd = cmd.trim();

  // Handle special cases
  if (trimmedCmd === "") return false;
  if (trimmedCmd === "exit") return false; // Don't allow exit

  // Handle compound commands (e.g., "pwd && echo")
  if (trimmedCmd.includes("&&")) {
    const parts = trimmedCmd.split("&&").map((part) => part.trim());
    return parts.every((part) => {
      const baseCommand = part.split(" ")[0];
      return ALLOWED_COMMANDS.includes(baseCommand);
    });
  }

  const baseCommand = trimmedCmd.split(" ")[0];

  return ALLOWED_COMMANDS.includes(baseCommand);
}

// Container manager
export class ContainerManager {
  private shellSessions: Map<string, Docker.Exec> = new Map();
  async createContainer(userEmail: string, projectId: string) {
    const projPath = path
      .join(__dirname, "../../user-projects", userEmail, projectId)
      .replace(/\\/g, "/");
    console.log("Project path : ", projPath);
    return await docker.createContainer({
      Image: "node:22-alpine",
      Cmd: ["/bin/bash"],
      Tty: true,
      OpenStdin: true,
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      WorkingDir: `/${projectId}`,
      User: "root",
      HostConfig: {
        Binds: [`${projPath}:/${projectId}`],
        Memory: 512 * 1024 * 1024, // 512MB limit
        MemorySwap: 1024 * 1024 * 1024, // 1GB swap
        NetworkMode: "bridge", // Enable internet connection
        AutoRemove: true,
      },
      Env: [
        "PS1=\\w\\$ ",
        "TERM=xterm-256color",
        "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/lib/node_modules/.bin",
        "HOME=/root",
      ],
    });
  }
  async createShellSession(container: Docker.Container, sessionId: string) {
    const exec = await container.exec({
      Cmd: ["/bin/bash", "-l"],
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      Env: [
        "PS1=\\w\\$ ",
        "TERM=xterm-256color",
        "BASH_ENV=/etc/profile",
        "HOME=/root",
      ],
    });

    this.shellSessions.set(sessionId, exec);
    return exec;
  }

  getShellSession(sessionId: string): Docker.Exec | undefined {
    return this.shellSessions.get(sessionId);
  }

  async executeCommand(container: Docker.Container, command: string) {
    const exec = await container.exec({
      Cmd: ["bash", "-c", command],
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
    });

    return await exec.start({ Detach: false, Tty: true });
  }

  async executeInShell(sessionId: string, command: string) {
    const session = this.shellSessions.get(sessionId);
    if (!session) {
      throw new Error("Shell session not found");
    }

    const stream = await session.start({
      Detach: false,
      Tty: true,
      hijack: true,
    });

    return stream;
  }

  removeShellSession(sessionId: string) {
    this.shellSessions.delete(sessionId);
  }
}
