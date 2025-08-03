import { useState } from "react";
import { FileNode } from "../types";
import { generateId } from "../utils/helper";

const initialFiles: FileNode[] = [
  {
    id: "src",
    name: "src",
    type: "dir",
    isOpen: false,
    children: [
      {
        id: "app-tsx",
        name: "App.tsx",
        type: "file",
        content: `import React from 'react';\n\nfunction App() {\n  return (\n    <div>\n      <h1>Hello World</h1>\n    </div>\n  );\n}\n\nexport default App;`,
      },
      {
        id: "main-tsx",
        name: "main.tsx",
        type: "file",
        content: `import React from 'react';\nimport ReactDOM from 'react-dom';\nimport App from './App';\n\nReactDOM.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n  document.getElementById('root')\n);`,
      },
    ],
  },
];

export const useFiles = () => {
  const [files, setFiles] = useState<FileNode[]>(initialFiles);

  const addFile = (parentId: string, isDirectory: boolean) => {
    const newName = isDirectory ? "New Folder" : "new-file.ts";
    const newNode: FileNode = {
      id: generateId(),
      name: newName,
      type: isDirectory ? "dir" : "file",
      content: isDirectory ? undefined : "",
      children: isDirectory ? [] : undefined,
    };

    const updateFiles = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === parentId) {
          return {
            ...node,
            children: [...(node.children || []), newNode],
          };
        }
        if (node.children) {
          return {
            ...node,
            children: updateFiles(node.children),
          };
        }
        return node;
      });
    };

    setFiles(updateFiles(files));
  };

  const updateFileContent = (fileId: string, content: string) => {
    const updateNodes = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === fileId) {
          return { ...node, content };
        }
        if (node.children) {
          return { ...node, children: updateNodes(node.children) };
        }
        return node;
      });
    };

    setFiles(updateNodes(files));
  };

  const setInitialFiles = (initial_files: FileNode[]) => {
    setFiles(initial_files);
  };

  return { files, addFile, updateFileContent, setInitialFiles };
};
