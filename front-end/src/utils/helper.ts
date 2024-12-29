import { FileNode, ServerFileType } from '../types';

export const generateId = () => {
	return Math.random().toString(36).substr(2, 9);
};

interface File {
	id: string;
	children?: File[];
}

export const findFileById = (files: File[], id: string): File | null => {
	for (const file of files) {
		if (file.id === id) return file;
		if (file.children) {
			const found = findFileById(file.children, id);
			if (found) return found;
		}
	}
	return null;
};

export const parseFileStructure = (files: ServerFileType[]) => {
	const updatedFiles: FileNode[] = [];
	console.log('Files: ', files);
	for (const file of files) {
		updatedFiles.push({
			id: file.name,
			name: file.name,
			type: file.type,
			isOpen: false,
			path: file.path,
			// children? ,
			// content?
		});
	}
	return updatedFiles.sort((a, b) => {
		// If types are different, sort directories before files
		if (a.type !== b.type) {
			return a.type === 'dir' ? -1 : 1;
		}
		// If types are the same, sort alphabetically by name
		return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
	});
};

export const updateFileNodeChildren = (
	fileNodes: FileNode[], // current file structure state
	path: string, // path of the directory to update
	children: FileNode[] // children to add to the directory
): FileNode[] => {
	return fileNodes.map((node) => {
		if (node.path === path) {
			return { ...node, children, isOpen: true }; // Update children and mark as open
		}
		if (node.children) {
			return {
				...node,
				children: updateFileNodeChildren(node.children, path, children),
			};
		}
		return node;
	});
};
