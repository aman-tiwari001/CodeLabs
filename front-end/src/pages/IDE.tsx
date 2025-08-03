import { useCallback, useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { DirectoryExplorer } from "../components/DirectoryExplorer";
import { CodeEditor } from "../components/CodeEditor";
import { CodeTerminal } from "../components/Terminal";
import { Tab, FileNode } from "../types";
import { io } from "socket.io-client";
import useFileStore from "../store/fileStore";
import {
  parseFileStructure,
  updateFileNodeChildren,
  toggleDirectoryOpen,
  renameFileNode,
  deleteFileNode,
  addFileToDirectory,
} from "../utils/helper";
import useSocketStore from "../store/socketStore";
import { useAuth0 } from "@auth0/auth0-react";
import toast from "react-hot-toast";
import { debounce } from "lodash";
import { Code2 } from "lucide-react";

const IDE = () => {
  const { logout } = useAuth0();

  const [tabs, setTabs] = useState<Tab[]>([]);
  const [filesLoaded, setFilesLoaded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const [updatingFile, setUpdatingFile] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [fetchingDirContents, setFetchingDirContents] =
    useState<boolean>(false);
  const [fetchingFileContents, setFetchingFileContents] =
    useState<boolean>(false);

  const files = useFileStore((state: any) => state.files);
  const setFiles = useFileStore((state: any) => state.setFiles);
  const socket = useSocketStore((state: any) => state.socket);
  const setSocket = useSocketStore((state: any) => state.setSocket);

  const projectId = window.location.pathname.split("/")[2]?.replace("%20", " ");

  const addFile = (node: FileNode, type: string, name: string) => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (!name.trim() || !/^[a-zA-Z0-9_.\s-]+$/.test(name)) {
      toast.error(
        'Name can only contain a-z, A-Z, 0-9, "_", "-", ".", and spaces',
      );
      return;
    }
    const newPath = node.path + "/" + name;
    console.log("Creating new file:", newPath, type);

    // Emit create event to server
    socket.emit("create-file", { path: newPath, type }, (response: any) => {
      if (response.success) {
        // Create the new file/directory node
        const newFileNode: FileNode = {
          id: name,
          name,
          type: type as "file" | "dir",
          path: newPath,
        };

        // Check if this is a root-level creation (node.id === 'root')
        if (node.id === "root") {
          // Add directly to the files array for root-level creation
          const updatedFiles = [...files, newFileNode].sort((a, b) => {
            if (a.type !== b.type) {
              return a.type === "dir" ? -1 : 1;
            }
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
          });
          setFiles(updatedFiles);
        } else {
          // Add the new file to the parent directory for nested creation
          const updatedFiles = addFileToDirectory(
            files,
            node.path,
            newFileNode,
          );
          setFiles(updatedFiles);
        }

        toast.success(`Created ${type} "${name}"`);
      } else {
        toast.error(response.error || `Failed to create ${type}`);
      }
    });
  };

  const renameFile = (node: FileNode, newName: string) => {
    // restrict all special characters except underscore and hyphen
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (!newName.trim() || !/^[a-zA-Z0-9_.\s-]+$/.test(newName)) {
      toast.error(
        'Name can only contain a-z, A-Z, 0-9, "_", "-", ".", and spaces',
      );
      return;
    }
    const newPath = node.path.replace(/[^/]+$/, newName);
    socket.emit(
      "rename-file",
      { oldPath: node.path, newPath, type: node.type },
      (response: any) => {
        if (response.success) {
          // Update local state
          const updatedStructure = renameFileNode(files, node.path, newName);
          setFiles(updatedStructure);

          // Update any open tabs with the old path
          const updatedTabs = tabs.map((tab) => {
            if (tab.path === node.path) {
              const pathParts = node.path.split("/");
              pathParts[pathParts.length - 1] = newName;
              const newPath = pathParts.join("/");
              return { ...tab, name: newName, path: newPath, id: newName };
            }
            return tab;
          });
          setTabs(updatedTabs);

          // Update active tab if it matches
          if (activeTab && activeTab.path === node.path) {
            const pathParts = node.path.split("/");
            pathParts[pathParts.length - 1] = newName;
            const newPath = pathParts.join("/");
            setActiveTab({
              ...activeTab,
              name: newName,
              path: newPath,
              id: newName,
            });
          }

          toast.success(`Renamed to "${newName}"`);
        } else {
          toast.error(response.message || "Failed to rename");
        }
      },
    );
  };

  const deleteFile = (node: FileNode) => {
    socket.emit(
      "delete-file",
      { path: node.path, type: node.type },
      (response: any) => {
        if (response.success) {
          const updatedStructure = deleteFileNode(files, node.path);
          setFiles(updatedStructure);

          // Close any open tabs for the deleted file/directory
          const updatedTabs = tabs.filter(
            (tab) => !tab.path.startsWith(node.path),
          );
          setTabs(updatedTabs);

          // Update active tab if needed
          if (activeTab && activeTab.path.startsWith(node.path)) {
            setActiveTab(updatedTabs.length > 0 ? updatedTabs[0] : null);
          }

          toast.success(`Deleted "${node.name}"`);
        } else {
          toast.error(response.error || "Failed to delete");
        }
      },
    );
  };

  const handleTabClose = (id: string) => {
    const updatedTabs = tabs.filter((tab) => tab.id !== id);
    setTabs(updatedTabs);

    if (activeTab?.id === id) {
      if (updatedTabs.length > 0) {
        const currentIndex = tabs.findIndex((tab) => tab.id === id);
        const nextTab =
          updatedTabs[Math.min(currentIndex, updatedTabs.length - 1)];
        setActiveTab(nextTab);
      } else {
        setActiveTab(null);
      }
    }
  };

  const debouncedEmit = useCallback(
    debounce((filePath: string, content: string) => {
      setUpdatingFile(true);
      socket.emit("update-file-content", { filePath, content }, () => {
        setUpdatingFile(false);
      });
    }, 1000),
    [socket],
  );

  const handleContentChange = (activeTab: Tab, content: string) => {
    setTabs(
      tabs.map((tab) => (tab.id === activeTab.id ? { ...tab, content } : tab)),
    );
    setActiveTab({ ...activeTab, content });
    debouncedEmit(activeTab.path, content);
  };

  const refreshProjectStructure = () => {
    socket.emit("refresh-project-structure", (response: any) => {
      if (response.success) {
        let newStructure = parseFileStructure(response.structure);
        setFiles(newStructure);
      } else {
        toast.error(response.error || "Failed to refresh project structure");
        setIsError(!isError);
      }
    });
  };

  const fetchDirContents = (node: FileNode) => {
    // If directory is already open and has children, just toggle it closed
    if (node.isOpen && node.children) {
      const updatedStructure = toggleDirectoryOpen(files, node.path);
      setFiles(updatedStructure);
      return;
    }

    // If directory is closed but has children, just toggle it open
    if (!node.isOpen && node.children) {
      const updatedStructure = toggleDirectoryOpen(files, node.path);
      setFiles(updatedStructure);
      return;
    }

    // Only fetch contents if directory doesn't have children yet
    if (!node.children) {
      setFetchingDirContents(true);
      console.log("Fetching contents for:", node.path);
      socket.emit(
        "fetch-folder-contents",
        node.path,
        (response: { success: boolean; folder: FileNode[]; error?: any }) => {
          if (response.success) {
            console.log("Fetched dir contents:", response);
            const parsedFiles = parseFileStructure(response.folder);
            const updatedStructure = updateFileNodeChildren(
              files,
              node.path,
              parsedFiles,
            );
            console.log("Updated structure:", updatedStructure);
            setFiles(updatedStructure);
            setFetchingDirContents(false);
          } else {
            toast.error(response.error || "Failed to fetch directory contents");
            setFetchingDirContents(false);
            setIsError(!isError);
          }
        },
      );
    }
  };

  const fetchFileContents = (node: FileNode) => {
    const existingTab = tabs.find((tab) => tab.id === node.id);

    // If tab already exists, just activate it
    if (existingTab) {
      setActiveTab(existingTab);
      return;
    }

    // If file has content cached, create tab with cached content
    if (node.content) {
      const newTab = {
        id: node.id,
        name: node.name,
        content: node.content,
        path: node.path,
      };
      setTabs([...tabs, newTab]);
      setActiveTab(newTab);
      return;
    }

    // Fetch content from server
    setFetchingFileContents(true);
    socket.emit(
      "fetch-file-content",
      node.path,
      (response: { success: boolean; content: string; error?: any }) => {
        if (response.success) {
          setFetchingFileContents(false);
          const newTab = {
            id: node.id,
            name: node.name,
            content: response.content,
            path: node.path,
          };
          setActiveTab(newTab);
          setTabs([...tabs, newTab]);
        } else {
          toast.error(response.error || "Failed to fetch file content");
          setFetchingFileContents(false);
          setIsError(!isError);
        }
      },
    );
  };

  useEffect(() => {
    const newSocket = io(
      `${import.meta.env.VITE_SERVER_URL}?projectId=${
        window.location.pathname.split("/")[2]
      }`,
      { withCredentials: true },
    );
    setSocket(newSocket);
    newSocket.on("connect", () => {
      console.log("Connected to the server");
    });
    newSocket.on("folder-structure", (data) => {
      const parsedFiles = parseFileStructure(data.structure);
      setFiles(parsedFiles);
      setFilesLoaded(true);
    });
    newSocket.on("auth-error", () => {
      toast.error("Session expired. Please login again");
      newSocket.disconnect();
      logout({ logoutParams: { returnTo: window.location.origin } });
    });

    return () => {
      newSocket.disconnect();
      console.log("Disconnected from the server");
    };
  }, [setFiles, setSocket, logout, isError]);

  useEffect(() => {
    return () => debouncedEmit.cancel?.();
  }, [debouncedEmit]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
    return (
      <div className="h-screen pt-16 overflow-hidden bg-gradient-to-br from-gray-950 via-black to-violet-950 text-white">
        <div className="flex flex-col px-10 items-center justify-center h-full">
          <h1 className="text-2xl font-bold text-violet-500 mb-4 flex gap-2 items-center">
            <Code2 color="white" size={27} /> IDE Not Available!
          </h1>
          <p className="text-lg text-justify">
            IDE is not available on mobile devices. You need to use a desktop or
            laptop to access it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen pt-16 overflow-hidden bg-gray-900 text-white">
      <PanelGroup direction="vertical">
        <Panel defaultSize={80} className="overflow-hidden">
          <PanelGroup direction="horizontal">
            <Panel defaultSize={15} minSize={15}>
              <DirectoryExplorer
                files={files}
                onAddFile={addFile}
                onRenameFile={renameFile}
                onDeleteFile={deleteFile}
                filesLoaded={filesLoaded}
                fetchDirContents={fetchDirContents}
                fetchFileContents={fetchFileContents}
                fetchingDirContents={fetchingDirContents}
                projectId={projectId}
              />
            </Panel>
            <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-blue-500 transition-colors" />
            <Panel minSize={30}>
              <CodeEditor
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(tab: Tab) => {
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
        <PanelResizeHandle className="h-1 bg-gray-700 hover:bg-blue-500 transition-colors" />
        <Panel defaultSize={20} minSize={10}>
          <CodeTerminal refreshProjectStructure={refreshProjectStructure} />
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default IDE;
