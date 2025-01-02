import React from 'react';
import Skeleton from 'react-loading-skeleton';

interface Props {
	content: string;
	onChange: (content: string) => void;
	fetchingFileContents: boolean;
}

export const EditorContent: React.FC<Props> = ({
	content,
	onChange,
	fetchingFileContents,
}) => {
	const lines = content.split('\n');

	return (
		<div className='flex-1 relative font-mono text-sm'>
			<div className='absolute inset-0 flex'>
				{/* Line Numbers */}
				<div className='flex-none w-7 py-4 bg-gray-800 text-gray-500 text-right select-none'>
					{lines.map((_, i) => (
						<div key={i} className='px-2'>
							{i + 1}
						</div>
					))}
				</div>

				{/* Editor Content */}
				{fetchingFileContents ? (
					<Skeleton count={13} baseColor='#6366f1' highlightColor='#dbb4ff' width={800} className='mx-4 mt-4' />
				) : (
					<textarea
						value={content}
						onChange={(e) => onChange(e.target.value)}
						className='flex-1 bg-gray-900 text-gray-300 p-4 text-lg resize-none focus:outline-none overflow-auto duration-100 transit'
						spellCheck={false}
						style={{ lineHeight: '1.5' }}
					/>
				)}
			</div>
		</div>
	);
};
