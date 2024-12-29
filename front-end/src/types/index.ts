export interface FileNode {
	id: string;
	name: string;
	type: 'file' | 'dir';
	path: string;
	content?: string;
	children?: FileNode[];
	isOpen?: boolean;
}

export interface Tab {
	id: string;
	name: string;
	content: string;
	path: string;
}

export interface FileContextMenuProps {
	x: number;
	y: number;
	onClose: () => void;
	onNewFile: () => void;
	onNewFolder: () => void;
	onDelete: () => void;
}

export interface ServerFileType {
	name: string;
	type: 'file' | 'dir';
	path: string;
}
