import { useCallback, useEffect, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { DirectoryExplorer } from '../components/DirectoryExplorer';
import { CodeEditor } from '../components/CodeEditor';
import { CodeTerminal } from '../components/Terminal';
import { Tab, FileNode } from '../types';
import { io } from 'socket.io-client';
import useFileStore from '../store/fileStore';
import { parseFileStructure, updateFileNodeChildren } from '../utils/helper';
import useSocketStore from '../store/socketStore';
import { useAuth0 } from '@auth0/auth0-react';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';

const IDE = () => {
	const { logout } = useAuth0();

	const [tabs, setTabs] = useState<Tab[]>([]);
	const [filesLoaded, setFilesLoaded] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState<Tab | null>(null);
	const [updatingFile, setUpdatingFile] = useState<boolean>(false);
	const [fetchingDirContents, setFetchingDirContents] =
		useState<boolean>(false);
	const [fetchingFileContents, setFetchingFileContents] =
		useState<boolean>(false);

	const files = useFileStore((state: any) => state.files);
	const setFiles = useFileStore((state: any) => state.setFiles);
	const socket = useSocketStore((state: any) => state.socket);
	const setSocket = useSocketStore((state: any) => state.setSocket);

	const addFile = (node: FileNode, type: string, name: string) => {
		if (type === 'file') {
			const children: FileNode[] = [
				{
					id: name,
					name,
					type: 'file',
					path: node.path + '/' + name,
				},
			];
			console.log('Add file', children);
			const updatedStr = updateFileNodeChildren(files, node.path, children);
			setFiles(updatedStr);
		} else {
			const children: FileNode[] = [
				{
					id: name,
					name,
					type: 'dir',
					path: node.path + '/' + name,
				},
			];
			console.log('Add file', children);
			const updatedStr = updateFileNodeChildren(files, node.path, children);
			setFiles(updatedStr);
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

	const refreshProjectStructure = () => {
		socket.emit('refresh-project-structure', (data: any) => {
			let formatStructure = data.structure.sort((a: any, b: any) => {
				if (a.type === 'dir' && b.type === 'file') return -1;
			});
			setFiles(formatStructure);
			console.log('Refreshed formatted structure: ', formatStructure);
		});
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
		const file = node;
		const existingTab = tabs.find((tab) => tab.id === file.id);

		if (!node.content) {
			setFetchingFileContents(true);
			socket.emit(
				'fetch-file-content',
				node.path,
				(data: { content: string }) => {
					setFetchingFileContents(false);
					setActiveTab({
						id: node.id,
						name: node.name,
						content: data.content,
						path: node.path,
					});
					if (!existingTab)
						setTabs([
							...tabs,
							{
								id: node.id,
								name: node.name,
								content: data.content,
								path: node.path,
							},
						]);
				}
			);
		}
	};

	useEffect(() => {
		const newSocket = io(
			`${import.meta.env.VITE_SERVER_URL}?projectId=${
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
			setFilesLoaded(true);
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
	}, [setFiles, setSocket, logout]);

	useEffect(() => {
		return () => debouncedEmit.cancel?.();
	}, [debouncedEmit]);

	return (
		<div className='h-screen pt-16 overflow-hidden bg-gray-900 text-white'>
			<PanelGroup direction='vertical'>
				<Panel defaultSize={80} className='overflow-hidden'>
					<PanelGroup direction='horizontal'>
						<Panel defaultSize={15} minSize={15}>
							<DirectoryExplorer
								files={files}
								onAddFile={addFile}
								filesLoaded={filesLoaded}
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
								onTabChange={(tab: Tab) => {
									console.log(tab);
									setActiveTab(tab);
								}}
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
					<CodeTerminal refreshProjectStructure={refreshProjectStructure} />
				</Panel>
			</PanelGroup>
		</div>
	);
};

export default IDE;
