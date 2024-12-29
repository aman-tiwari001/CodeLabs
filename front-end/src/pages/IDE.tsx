import { useCallback, useEffect, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { DirectoryExplorer } from '../components/DirectoryExplorer';
import { CodeEditor } from '../components/CodeEditor';
import { Terminal } from '../components/Terminal';
import { Tab, FileNode } from '../types';
import { io } from 'socket.io-client';
import useFileStore from '../store/fileStore';
import { parseFileStructure, updateFileNodeChildren } from '../utils/helper';
import useSocketStore from '../store/socketStore';
import { useAuth0 } from '@auth0/auth0-react';
import toast from 'react-hot-toast';
import { debounce, set } from 'lodash';

const IDE = () => {
	const { logout } = useAuth0();
	const [tabs, setTabs] = useState<Tab[]>([]);
	const [activeTab, setActiveTab] = useState<Tab | null>(null);

	const [fetchingDirContents, setFetchingDirContents] = useState(false);
	const [fetchingFileContents, setFetchingFileContents] = useState(false);
	const [updatingFile, setUpdatingFile] = useState(false);

	const addFile = () => {};

	const setFiles = useFileStore((state) => state.setFiles);
	const files = useFileStore((state) => state.files);

	const setSocket = useSocketStore((state) => state.setSocket);
	const socket = useSocketStore((state) => state.socket);

	const handleFileSelect = async (file: FileNode) => {
		if (file.type === 'file') {
			const existingTab = tabs.find((tab) => tab.id === file.id);
			if (!existingTab) {
				const newTab: Tab = {
					id: file.id,
					name: file.name,
					content: '',
					path: file.path,
				};
				setTabs([...tabs, newTab]);
				setActiveTab(newTab);
			}
		}
	};

	const handleTabClose = (id: string) => {
		setTabs(tabs.filter((tab) => tab.id !== id));
		if (activeTab?.id === id) {
			setActiveTab(tabs[0] || null);
		}
	};

	const debouncedEmit = useCallback(
		debounce((filePath: string, content: string) => {
			setUpdatingFile(true);
			socket.emit('update-file-content', { filePath, content }, () => {
				setUpdatingFile(false);
				// toast.success('All changes synced');
			});
		}, 1000),
		[socket]
	);

	const handleContentChange = (activeTab: Tab, content: string) => {
		setTabs(
			tabs.map((tab) => (tab.id === activeTab.id ? { ...tab, content } : tab))
		);
		setActiveTab({ ...activeTab, content });
		debouncedEmit(activeTab.path, content);
	};

	const fetchDirContents = (node: FileNode) => {
		if (!node.isOpen && !node.children) {
			setFetchingDirContents(true);
			console.log('Clicked Node: ', node);
			socket.emit(
				'fetch-folder-contents',
				node.path,
				(data: { folder: FileNode[] }) => {
					console.log('fetched dir contents', data);
					const parsedFiles = parseFileStructure(data.folder);
					const updatedStructure = updateFileNodeChildren(
						files,
						node.path,
						parsedFiles
					);
					console.log('Updated structure: ', updatedStructure);
					setFiles(updatedStructure);
					setFetchingDirContents(false);
				}
			);
		}
	};

	const fetchFileContents = (node: FileNode) => {
		if (!node.content) {
			setFetchingFileContents(true);
			setFetchingFileContents(true);
			socket.emit(
				'fetch-file-content',
				node.path,
				(data: { content: string }) => {
					console.log('fetched file contents', data);
					setFetchingFileContents(false);
					setActiveTab({ ...node, content: data.content });
					setFetchingDirContents(false);
					return data.content;
				}
			);
		}
		// return '';
	};

	useEffect(() => {
		const newSocket = io(
			`http://localhost:5000?projectId=${
				window.location.pathname.split('/')[2]
			}`,
			{ withCredentials: true }
		);
		setSocket(newSocket);
		newSocket.on('connect', () => {
			console.log('Connected to the server');
		});
		newSocket.on('folder-structure', (data) => {
			const parsedFiles = parseFileStructure(data.structure);
			setFiles(parsedFiles);
		});
		newSocket.on('auth-error', () => {
			toast.error('Session expired. Please login again');
			newSocket.disconnect();
			logout({ logoutParams: { returnTo: window.location.origin } });
		});

		return () => {
			newSocket.disconnect();
			console.log('Disconnected from the server');
		};
	}, [setFiles, setSocket]);

	return (
		<div className='h-screen pt-16 overflow-hidden bg-gray-900 text-white'>
			<PanelGroup direction='vertical'>
				<Panel defaultSize={80} className='overflow-hidden'>
					<PanelGroup direction='horizontal'>
						<Panel defaultSize={20} minSize={15}>
							<DirectoryExplorer
								files={files}
								onFileSelect={handleFileSelect}
								onAddFile={addFile}
								fetchDirContents={fetchDirContents}
								fetchFileContents={fetchFileContents}
								fetchingDirContents={fetchingDirContents}
							/>
						</Panel>
						<PanelResizeHandle className='w-1 bg-gray-700 hover:bg-blue-500 transition-colors' />
						<Panel minSize={30}>
							<CodeEditor
								tabs={tabs}
								activeTab={activeTab}
								onTabChange={setActiveTab}
								onTabClose={handleTabClose}
								onContentChange={handleContentChange}
								fetchingFileContents={fetchingFileContents}
								updatingFile={updatingFile}
							/>
						</Panel>
					</PanelGroup>
				</Panel>
				<PanelResizeHandle className='h-1 bg-gray-700 hover:bg-blue-500 transition-colors' />
				<Panel defaultSize={20} minSize={10}>
					<Terminal />
				</Panel>
			</PanelGroup>
		</div>
	);
};

export default IDE;