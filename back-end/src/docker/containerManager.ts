import Docker from 'dockerode';

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
		return await docker.createContainer({
			Image: 'node:latest',
			Cmd: ['/bin/bash'],
			Tty: true, 
			WorkingDir: `/user-projects/${userEmail}/${projectId}`,
			HostConfig: {
				Memory: 512 * 1024 * 1024, // 512MB limit
				MemorySwap: 1024 * 1024 * 1024, // 1GB swap
				NetworkMode: 'none', // Disable network access
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
