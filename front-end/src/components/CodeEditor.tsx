import React from 'react';
import { Tab } from '../types';
import { X } from 'lucide-react';
import { EditorContent } from './EditorContent';

interface Props {
	tabs: Tab[];
	activeTab: Tab | null;
	onTabChange: (tab: Tab) => void;
	onTabClose: (id: string) => void;
	onContentChange: (activeTab: Tab, content: string) => void;
	fetchingFileContents: boolean;
	updatingFile: boolean;
}

export const CodeEditor: React.FC<Props> = ({
	tabs,
	activeTab,
	onTabChange,
	onTabClose,
	onContentChange,
	fetchingFileContents,
	updatingFile,
}) => {
	return (
		<div className='h-full flex flex-col bg-gray-900 text-gray-300'>
			<div className='flex border-b border-gray-700'>
				{tabs.map((tab) => (
					<div
						key={tab.id}
						className={`px-4 py-2 text-sm border-r border-gray-700 flex items-center gap-2 cursor-pointer
              ${
								tab === activeTab
									? 'bg-gray-800'
									: 'bg-gray-900 hover:bg-gray-800'
							}`}
						onClick={() => onTabChange(tab)}
					>
						<span className='font-semibold'>{tab.name}</span>
						{updatingFile && tab.id == activeTab?.id && (
							<div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
						)}
						<button
							className='hover:bg-gray-700 rounded p-1'
							onClick={(e) => {
								e.stopPropagation();
								onTabClose(tab.id);
							}}
						>
							<X size={12} />
						</button>
					</div>
				))}
			</div>
			<EditorContent
				content={activeTab?.content || ''}
				onChange={(content) => {
					if (activeTab) {
						// setActiveContent(content);
						onContentChange(activeTab, content);
					}
				}}
				fetchingFileContents={fetchingFileContents}
			/>
		</div>
	);
};
