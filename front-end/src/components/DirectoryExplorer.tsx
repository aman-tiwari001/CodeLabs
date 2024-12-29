import React, { useState } from 'react';
import {
	FolderIcon,
	FileIcon,
	ChevronDownIcon,
	ChevronRightIcon,
	PlusIcon,
} from 'lucide-react';
import { FileNode } from '../types';
import Skeleton from 'react-loading-skeleton';

interface Props {
	files: FileNode[];
	onFileSelect: (file: FileNode) => void;
	onAddFile: (parentId: string, isDirectory: boolean) => void;
	fetchDirContents: (node: FileNode) => void;
	fetchFileContents: (node: FileNode) => void;
	fetchingDirContents: boolean;
}

const FileTreeNode: React.FC<{
	node: FileNode;
	depth: number;
	onSelect: (file: FileNode) => void;
	onAddFile: (parentId: string, isDirectory: boolean) => void;
	fetchDirContents: (node: FileNode) => void;
	fetchFileContents: (node: FileNode) => void;
	fetchingDirContents: boolean;
}> = ({ node, depth, onSelect, onAddFile, fetchDirContents, fetchFileContents, fetchingDirContents }) => {
	const [isOpen, setIsOpen] = useState(node.isOpen || false);
	const [showActions, setShowActions] = useState(false);

	return (
		<div>
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
						onSelect(node);
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
								onAddFile(node.id, false);
							}}
							className='p-1 hover:bg-gray-600 rounded'
						>
							<PlusIcon size={12} />
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								onAddFile(node.id, true);
							}}
							className='p-1 hover:bg-gray-600 rounded'
						>
							<FolderIcon size={12} />
						</button>
					</div>
				)}
			</div>
			{isOpen && fetchingDirContents && <Skeleton count={2} height={15} baseColor='#6366f1' highlightColor='#dbb4ff' width={190} className='mx-4' />}
			{isOpen &&
				node.children?.map((child) => (
					<FileTreeNode
						key={child.id}
						node={child}
						depth={depth + 1}
						onSelect={onSelect}
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
	onFileSelect,
	onAddFile,
	fetchDirContents,
	fetchFileContents,
	fetchingDirContents
}) => {
	return (
		<div className='h-full bg-gray-900 border-r border-gray-700 overflow-hidden flex flex-col'>
			<div className='p-2 text-sm text-gray-400 font-medium border-b border-gray-700 flex justify-between items-center'>
				<span className='font-bold'>EXPLORER</span>
			</div>
			<div className='overflow-y-auto flex-1'>
				{files.map((node) => (
					<FileTreeNode
						key={node.id}
						node={node}
						depth={0}
						onSelect={onFileSelect}
						onAddFile={onAddFile}
						fetchDirContents={fetchDirContents}
						fetchFileContents={fetchFileContents}
						fetchingDirContents={fetchingDirContents}
					/>
				))}
			</div>
		</div>
	);
};
