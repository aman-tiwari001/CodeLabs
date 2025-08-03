import React, { useState } from 'react';
import {
	FolderIcon,
	FileIcon,
	ChevronDownIcon,
	ChevronRightIcon,
	EditIcon,
	TrashIcon,
} from 'lucide-react';
import { FileNode } from '../types';
import Skeleton from 'react-loading-skeleton';
import { VscNewFile } from 'react-icons/vsc';
import { CgFolderAdd } from 'react-icons/cg';
import { useAuth0 } from '@auth0/auth0-react';
import toast from 'react-hot-toast';

interface Props {
	files: FileNode[];
	onAddFile: (node: FileNode, type: string, name: string) => void;
	onRenameFile: (node: FileNode, newName: string) => void;
	onDeleteFile: (node: FileNode) => void;
	fetchDirContents: (node: FileNode) => void;
	fetchFileContents: (node: FileNode) => void;
	fetchingDirContents: boolean;
	filesLoaded: boolean;
	projectId: string;
}

const FileTreeNode: React.FC<{
	node: FileNode;
	depth: number;
	onAddFile: (node: FileNode, type: string, name: string) => void;
	onRenameFile: (node: FileNode, newName: string) => void;
	onDeleteFile: (node: FileNode) => void;
	fetchDirContents: (node: FileNode) => void;
	fetchFileContents: (node: FileNode) => void;
	fetchingDirContents: boolean;
}> = ({
	node,
	depth,
	onAddFile,
	onRenameFile,
	onDeleteFile,
	fetchDirContents,
	fetchFileContents,
	fetchingDirContents,
}) => {
	const [showActions, setShowActions] = useState(false);
	const [isRenaming, setIsRenaming] = useState(false);

	const handleClick = () => {
		if (isRenaming) return;
		if (node.type === 'dir') {
			fetchDirContents(node);
		} else {
			fetchFileContents(node);
		}
	};

	const handleRename = () => {
		setIsRenaming(true);
		setShowActions(false);
	};

	const handleDelete = () => {
		if (confirm(`Are you sure you want to delete "${node.name}"?`)) {
			onDeleteFile(node);
		}
	};

	const createInput = (
		type: 'file' | 'dir' | 'rename',
		placeholder: string
	) => {
		// Remove any existing input
		const existingInput = document.getElementById('input-new-file');
		if (existingInput) existingInput.remove();

		const parentNode = document.getElementById(node.id);
		const input = document.createElement('input');
		input.style.width = type == 'rename' ? '10%' : '80%';
		input.style.marginLeft = type == 'rename' ? '25px' : '0px';
		input.placeholder = placeholder;
		input.className =
			'input-new-file bg-gray-800 text-white p-1 text-sm rounded border border-blue-500 w-full mt-1';
		input.id = 'input-new-file';

		if (type === 'rename') {
			input.value = node.name;
			input.className =
				'input-rename bg-gray-800 text-white p-1 text-sm rounded border border-blue-500';
			input.style.position = 'absolute';
			input.style.left = '0';
			input.style.right = '0';
			input.style.zIndex = '10';
		}

		parentNode?.appendChild(input);
		input.focus();

		if (type === 'rename') {
			input.select();
		}

		input.onkeydown = (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				if (input.value.trim()) {
					if (type === 'rename') {
						onRenameFile(node, input.value.trim());
						setIsRenaming(false);
					} else {
						onAddFile(node, type, input.value.trim());
					}
				}
				input.remove();
			}
			if (e.key === 'Escape') {
				e.preventDefault();
				if (type === 'rename') {
					setIsRenaming(false);
				}
				input.remove();
			}
		};

		input.onblur = () => {
			if (type === 'rename') {
				setIsRenaming(false);
			}
			input.remove();
		};
	};

	return (
		<div id={node.id}>
			<div
				className='flex items-center group hover:bg-gray-700/50 py-1 px-2 cursor-pointer text-gray-300'
				style={{ paddingLeft: `${depth * 1.2 + 0.5}rem` }}
				onMouseEnter={() => setShowActions(true)}
				onMouseLeave={() => setShowActions(false)}
				onClick={handleClick}
			>
				{node.type === 'dir' &&
					(node.isOpen ? (
						<ChevronDownIcon size={16} className='mr-1 flex-shrink-0' />
					) : (
						<ChevronRightIcon size={16} className='mr-1 flex-shrink-0' />
					))}
				{node.type === 'file' && <div className='w-4 mr-1 flex-shrink-0'></div>}
				{node.type === 'dir' ? (
					<FolderIcon size={16} className='mr-2 text-blue-400 flex-shrink-0' />
				) : (
					<FileIcon size={16} className='mr-2 text-gray-400 flex-shrink-0' />
				)}
				<span className={`flex-1 truncate ${isRenaming ? 'relative' : ''}`}>
					{isRenaming ? '' : node.name}
				</span>
				{showActions && !isRenaming && (
					<div className='flex gap-1 ml-2'>
						{node.type === 'dir' && (
							<>
								<button
									onClick={(e) => {
										e.stopPropagation();
										createInput('file', 'Enter file name');
									}}
									className='p-1 hover:bg-gray-600 rounded transition-colors'
									title='New File'
								>
									<VscNewFile size={12} />
								</button>
								<button
									onClick={(e) => {
										e.stopPropagation();
										createInput('dir', 'Enter directory name');
									}}
									className='p-1 hover:bg-gray-600 rounded transition-colors'
									title='New Folder'
								>
									<CgFolderAdd size={12} />
								</button>
							</>
						)}
						<button
							onClick={(e) => {
								e.stopPropagation();
								handleRename();
								createInput('rename', 'Enter new name');
							}}
							className='p-1 hover:bg-blue-600 rounded transition-colors'
							title='Rename'
						>
							<EditIcon size={12} />
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								handleDelete();
							}}
							className='p-1 hover:bg-red-600 rounded transition-colors'
							title='Delete'
						>
							<TrashIcon size={12} />
						</button>
					</div>
				)}
			</div>
			{node.isOpen && fetchingDirContents && (
				<div style={{ paddingLeft: `${(depth + 1) * 1.2 + 0.5}rem` }}>
					<Skeleton
						count={2}
						height={15}
						baseColor='#374151'
						highlightColor='#4B5563'
						width={`calc(100% - ${(depth + 1) * 1.2 + 0.5}rem)`}
					/>
				</div>
			)}
			{node.isOpen &&
				node.children?.map((child) => (
					<FileTreeNode
						key={`${child.path}-${child.name}`}
						node={child}
						depth={depth + 1}
						onAddFile={onAddFile}
						onRenameFile={onRenameFile}
						onDeleteFile={onDeleteFile}
						fetchDirContents={fetchDirContents}
						fetchFileContents={fetchFileContents}
						fetchingDirContents={fetchingDirContents}
					/>
				))}
		</div>
	);
};

export const DirectoryExplorer: React.FC<Props> = ({
	files,
	onAddFile,
	onRenameFile,
	onDeleteFile,
	filesLoaded,
	fetchDirContents,
	fetchFileContents,
	fetchingDirContents,
	projectId
}) => {
	const { user } = useAuth0();
	const createRootInput = (type: 'file' | 'dir', placeholder: string) => {
		// Remove any existing input
		const existingInput = document.getElementById('input-new-file-src');
		if (existingInput) existingInput.remove();

		const parentNode = document.getElementById('root-dir');
		const input = document.createElement('input');
		input.placeholder = placeholder;
		input.className =
			'input-new-file-src bg-gray-800 text-white p-2 text-sm rounded border border-blue-500 w-full mb-2';
		input.id = 'input-new-file-src';
		parentNode?.appendChild(input);
		input.focus();

		input.onkeydown = (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				if (input.value.trim()) {
					addToSrcDir(input.value.trim(), type);
				}
				input.remove();
			}
			if (e.key === 'Escape') {
				e.preventDefault();
				input.remove();
			}
		};

		input.onblur = () => {
			input.remove();
		};
	};

	const addToSrcDir = (name: string, type: 'file' | 'dir') => {
		if (!user || !user.email) {
			toast.error('Something went wrong');
			return;
		}
		const rootPath = `./user-projects/${user?.email}/${projectId}`;
		console.log('Adding to src dir:', rootPath, type);
		const rootNode: FileNode = {
			id: 'root',
			name: 'root',
			type : 'dir',
			path: rootPath,
		};

		onAddFile(rootNode, type, name);
	};

	return (
		<div className='h-full bg-black border-r border-gray-700 overflow-hidden flex flex-col'>
			<div className='p-2 text-sm text-gray-400 font-medium border-b border-gray-700 flex justify-between items-center'>
				<span className='font-bold'>EXPLORER</span>
				<div className='flex gap-1'>
					<button
						className='bg-transparent p-2 hover:bg-gray-700 rounded'
						onClick={(e) => {
							e.stopPropagation();
							createRootInput('file', 'Enter file name');
						}}
						title='New File'
					>
						<VscNewFile size={15} />
					</button>
					<button
						className='bg-transparent p-2 hover:bg-gray-700 rounded'
						onClick={(e) => {
							e.stopPropagation();
							createRootInput('dir', 'Enter directory name');
						}}
						title='New Folder'
					>
						<CgFolderAdd size={15} />
					</button>
				</div>
			</div>
			<div id='root-dir'></div>
			<div className='overflow-y-auto flex-1'>
				{filesLoaded ? (
					files.map((node) => (
						<FileTreeNode
							key={`${node.path}-${node.name}`}
							node={node}
							depth={0}
							onAddFile={onAddFile}
							onRenameFile={onRenameFile}
							onDeleteFile={onDeleteFile}
							fetchDirContents={fetchDirContents}
							fetchFileContents={fetchFileContents}
							fetchingDirContents={fetchingDirContents}
						/>
					))
				) : (
					<div className='p-4'>
						<Skeleton
							count={7}
							height={20}
							baseColor='#374151'
							highlightColor='#4B5563'
							width='100%'
							className='mb-2'
						/>
					</div>
				)}
				{filesLoaded && files.length === 0 && (
					<div className='text-gray-300 text-center mt-10'>No files found</div>
				)}
			</div>
		</div>
	);
};
