import Docker from 'dockerode';
import path from 'path';

const docker = new Docker();

const HOST_USER_PROJECTS_PATH =
	process.env.HOST_USER_PROJECTS_PATH ||
	path.join(__dirname, '../../user-projects');

// Use node:22 (Debian-based) instead of alpine - has bash and common tools
const NODE_IMAGE = 'node:22';

// Pull image if not exists
async function ensureImageExists(imageName: string): Promise<void> {
	try {
		await docker.getImage(imageName).inspect();
		console.log(`Image ${imageName} already exists`);
	} catch (error: any) {
		if (error.statusCode === 404) {
			console.log(`Pulling image ${imageName}...`);
			await new Promise<void>((resolve, reject) => {
				docker.pull(imageName, (err: any, stream: any) => {
					if (err) return reject(err);
					docker.modem.followProgress(stream, (err: any) => {
						if (err) return reject(err);
						console.log(`Image ${imageName} pulled successfully`);
						resolve();
					});
				});
			});
		} else {
			throw error;
		}
	}
}

const ALLOWED_COMMANDS = [
	'npm',
	'npx',
	'tsc',
	'git',
	'node',
	'ls',
	'cd',
	'mkdir',
	'rm',
	'rmdir',
	'touch',
	'cp',
	'cat',
	'clear',
	'pwd',
	'echo',
	'head',
	'tail',
	'history',
];

// Validate command
export function validateCommand(cmd: string) {
	const trimmedCmd = cmd.trim();

	// Handle special cases
	if (trimmedCmd === '') return false;
	if (trimmedCmd === 'exit') return false; // Don't allow exit

	// Handle compound commands (e.g., "pwd && echo")
	if (trimmedCmd.includes('&&')) {
		const parts = trimmedCmd.split('&&').map((part) => part.trim());
		return parts.every((part) => {
			const baseCommand = part.split(' ')[0];
			return ALLOWED_COMMANDS.includes(baseCommand);
		});
	}

	const baseCommand = trimmedCmd.split(' ')[0];

	return ALLOWED_COMMANDS.includes(baseCommand);
}

// Container manager
export class ContainerManager {
	private shellSessions: Map<string, Docker.Exec> = new Map();
	async createContainer(userEmail: string, projectId: string) {
		try {
			// Ensure node image exists (pull if needed)
			await ensureImageExists(NODE_IMAGE);

			const projPath = path
				.join(HOST_USER_PROJECTS_PATH, userEmail, projectId)
				.replace(/\\/g, '/');
			console.log('Project path : ', projPath);
			return await docker.createContainer({
				Image: NODE_IMAGE,
				Cmd: ['tail', '-f', '/dev/null'], // Keep container running indefinitely
				Tty: true,
				OpenStdin: true,
				AttachStdin: true,
				AttachStdout: true,
				AttachStderr: true,
				WorkingDir: `/${projectId}`,
				User: 'root',
				HostConfig: {
					Binds: [`${projPath}:/${projectId}`],
					Memory: 512 * 1024 * 1024, // 512MB limit
					MemorySwap: 1024 * 1024 * 1024, // 1GB swap
					NetworkMode: 'bridge', // Enable internet connection
					AutoRemove: false, // Don't auto-remove so we can reuse
				},
				Env: [
					'PS1=\\w\\$ ',
					'TERM=xterm-256color',
					'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/lib/node_modules/.bin',
					'HOME=/root',
				],
			});
		} catch (error) {
			console.error('Failed to create container:', error);
			throw error;
		}
	}
	async createShellSession(container: Docker.Container, sessionId: string) {
		const exec = await container.exec({
			Cmd: ['/bin/bash', '-l'],
			AttachStdin: true,
			AttachStdout: true,
			AttachStderr: true,
			Tty: true,
			Env: [
				'PS1=\\w\\$ ',
				'TERM=xterm-256color',
				'BASH_ENV=/etc/profile',
				'HOME=/root',
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
			Cmd: ['bash', '-c', command],
			AttachStdout: true,
			AttachStderr: true,
			Tty: true,
		});

		return await exec.start({ Detach: false, Tty: true });
	}

	async executeInShell(sessionId: string, command: string) {
		const session = this.shellSessions.get(sessionId);
		if (!session) {
			throw new Error('Shell session not found');
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
