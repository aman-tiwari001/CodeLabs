import React, { useState } from 'react';
import {
	FolderIcon,
	FileIcon,
	ChevronDownIcon,
	ChevronRightIcon,
} from 'lucide-react';
import { FileNode } from '../types';
import Skeleton from 'react-loading-skeleton';
import { VscNewFile } from 'react-icons/vsc';
import { CgFolderAdd } from 'react-icons/cg';
import useFileStore from '../store/fileStore';

interface Props {
	files: FileNode[];
	onAddFile: (node: FileNode, type: string, name: string) => void;
	fetchDirContents: (node: FileNode) => void;
	fetchFileContents: (node: FileNode) => void;
	fetchingDirContents: boolean;
}

const FileTreeNode: React.FC<{
	node: FileNode;
	depth: number;
	onAddFile: (node: FileNode, type: string, name: string) => void;
	fetchDirContents: (node: FileNode) => void;
	fetchFileContents: (node: FileNode) => void;
	fetchingDirContents: boolean;
}> = ({
	node,
	depth,
	onAddFile,
	fetchDirContents,
	fetchFileContents,
	fetchingDirContents,
}) => {
	const [isOpen, setIsOpen] = useState(node.isOpen || false);
	const [showActions, setShowActions] = useState(false);

	return (
		<div id={node.id}>
			<div
				className='flex items-center group hover:bg-gray-700/50 py-1 px-2 cursor-pointer text-gray-300'
				style={{ paddingLeft: `${depth * 1.2}rem` }}
				onMouseEnter={() => setShowActions(true)}
				onMouseLeave={() => setShowActions(false)}
				onClick={() => {
					if (node.type === 'dir') {
						fetchDirContents(node);
						setIsOpen(!isOpen);
					} else {
						fetchFileContents(node);
					}
				}}
			>
				{node.type === 'dir' &&
					(isOpen ? (
						<ChevronDownIcon size={16} />
					) : (
						<ChevronRightIcon size={16} />
					))}
				{node.type === 'dir' ? (
					<FolderIcon size={16} className='mr-2 text-blue-400' />
				) : (
					<FileIcon size={16} className='mr-2 text-gray-400' />
				)}
				<span className='flex-1'>{node.name}</span>
				{node.type === 'dir' && showActions && (
					<div className='flex gap-1'>
						<button
							onClick={(e) => {
								e.stopPropagation();
								if (document.getElementById('input-new-file')) {
									return document.getElementById('input-new-file')?.remove();
								}
								const parentNode = document.getElementById(node.id);
								const input = document.createElement('input');
								input.placeholder = 'Enter file name';
								input.className = 'input-new-file';
								input.id = 'input-new-file';
								parentNode?.appendChild(input);
								input.onkeydown = (e) => {
									if (e.key === 'Enter') {
										input.style.display = 'none';
										if (input.value) onAddFile(node, 'file', input.value);
									}
								};
							}}
							className='p-1 hover:bg-gray-600 rounded'
						>
							<VscNewFile size={12} />
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								if (document.getElementById('input-new-file')) {
									return document.getElementById('input-new-file')?.remove();
								}
								const parentNode = document.getElementById(node.id);
								const input = document.createElement('input');
								input.placeholder = 'Enter directory name';
								input.className = 'input-new-file';
								input.id = 'input-new-file';
								parentNode?.appendChild(input);
								input.onkeydown = (e) => {
									if (e.key === 'Enter') {
										input.style.display = 'none';
										if (input.value) onAddFile(node, 'dir', input.value);
									}
								};
							}}
							className='p-1 hover:bg-gray-600 rounded'
						>
							<FolderIcon size={12} />
						</button>
					</div>
				)}
			</div>
			{isOpen && fetchingDirContents && (
				<Skeleton
					count={2}
					height={15}
					baseColor='#6366f1'
					highlightColor='#dbb4ff'
					width={190}
					className='mx-4'
				/>
			)}
			{isOpen &&
				node.children?.map((child) => (
					<FileTreeNode
						key={child.id}
						node={child}
						depth={depth + 1}
						onAddFile={onAddFile}
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
	fetchDirContents,
	fetchFileContents,
	fetchingDirContents,
}) => {
	const setFiles = useFileStore((state) => state.setFiles);

	const addToSrcDir = (name: string, type: 'file' | 'dir') => {
		const path = files[0].path.split('/').slice(0, -1).join('/');
		const node: FileNode = {
			id: name,
			name,
			type,
			path: `${path}/${name}`,
			children: [],
		};
		setFiles([...files, node]);
	};

	return (
		<div className='h-full bg-black border-r border-gray-700 overflow-hidden flex flex-col'>
			<div className='p-2 text-sm text-gray-400 font-medium border-b border-gray-700 flex justify-between items-center'>
				<span className='font-bold'>EXPLORER</span>
				<div className='flex gap-1'>
					<button
						className='bg-transparent p-2'
						onClick={(e) => {
							e.stopPropagation();
							if (document.getElementById('input-new-file-src')) {
								return document.getElementById('input-new-file-src')?.remove();
							}
							const parentNode = document.getElementById('root-dir');
							const input = document.createElement('input');
							input.placeholder = 'Enter file name';
							input.className = 'input-new-file-src';
							input.id = 'input-new-file-src';
							parentNode?.appendChild(input);
							input.onkeydown = (e) => {
								if (e.key === 'Enter') {
									input.style.display = 'none';
									if (input.value) addToSrcDir(input.value, 'file');
								}
							};
						}}
					>
						<VscNewFile size={15} />
					</button>
					<button
						className='bg-transparent p-2'
						onClick={(e) => {
							e.stopPropagation();
							if (document.getElementById('input-new-file-src')) {
								return document.getElementById('input-new-file-src')?.remove();
							}
							const parentNode = document.getElementById('root-dir');
							const input = document.createElement('input');
							input.placeholder = 'Enter directory name';
							input.className = 'input-new-file-src';
							input.id = 'input-new-file-src';
							parentNode?.appendChild(input);
							input.onkeydown = (e) => {
								if (e.key === 'Enter') {
									input.style.display = 'none';
									if (input.value) addToSrcDir(input.value, 'dir');
								}
							};
						}}
					>
						<CgFolderAdd size={15} />
					</button>
				</div>
			</div>
			<div id='root-dir'></div>
			<div className='overflow-y-auto flex-1'>
				{files.length ? (
					files.map((node) => (
						<FileTreeNode
							key={node.id}
							node={node}
							depth={0}
							onAddFile={onAddFile}
							fetchDirContents={fetchDirContents}
							fetchFileContents={fetchFileContents}
							fetchingDirContents={fetchingDirContents}
						/>
					))
				) : (
					<Skeleton
						count={7}
						height={15}
						baseColor='#6366f1'
						highlightColor='#dbb4ff'
						width={190}
						className='mx-4'
					/>
				)}
			</div>
		</div>
	);
};
