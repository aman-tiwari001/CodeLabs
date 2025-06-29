import Docker from 'dockerode';
import path from 'path';

const docker = new Docker();

const ALLOWED_COMMANDS = [
	'npm',
	'node',
	'git',
	'yarn',
	'ls',
	'cd',
	'mkdir',
	'touch',
	'ls',
	'cat'
];

// Validate command
export function validateCommand(cmd: string) {
	const baseCommand = cmd.split(' ')[0];
	console.log('Base command : ', baseCommand);
	return ALLOWED_COMMANDS.includes(baseCommand);
}

// Container manager
export class ContainerManager {
	async createContainer(userEmail: string, projectId: string) {
		const projPath = path
			.join(__dirname, '../../user-projects', userEmail, projectId)
			.replace(/\\/g, '/');
		console.log('Project path : ', projPath);
		return await docker.createContainer({
			Image: 'node:latest',
			Cmd: ['/bin/bash'],
			Tty: true,
			WorkingDir: `/${projectId}`,
			HostConfig: {
				Binds: [`${projPath}:/${projectId}`],
				Memory: 512 * 1024 * 1024, // 512MB limit
				MemorySwap: 1024 * 1024 * 1024, // 1GB swap
				NetworkMode: 'bridge', // Enable internet connection
				AutoRemove: true,
			},
		});
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
}
