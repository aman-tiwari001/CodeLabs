import { FileNode, ServerFileType } from "../types";

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
  for (const file of files) {
    updatedFiles.push({
      id: file.name,
      name: file.name,
      type: file.type,
      isOpen: false,
      path: file.path,
    });
  }
  return updatedFiles.sort((a, b) => {
    // If types are different, sort directories before files
    if (a.type !== b.type) {
      return a.type === "dir" ? -1 : 1;
    }
    // If types are the same, sort alphabetically by name
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
};

export const updateFileNodeChildren = (
  fileNodes: FileNode[], // current file structure state
  path: string, // path of the directory to update
  children: FileNode[], // children to add to the directory
): FileNode[] => {
  return fileNodes.map((node) => {
    if (node.path === path) {
      // Always update children - merge new files with existing ones or replace completely
      // This ensures new files created via terminal commands are reflected in the UI
      return {
        ...node,
        children: children.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === "dir" ? -1 : 1;
          }
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        }),
        isOpen: true,
      };
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

export const addFileToDirectory = (
  fileNodes: FileNode[],
  directoryPath: string,
  newFile: FileNode,
): FileNode[] => {
  return fileNodes.map((node) => {
    if (node.path === directoryPath && node.type === "dir") {
      const existingChildren = node.children || [];
      // Check if file already exists to prevent duplicates
      const fileExists = existingChildren.some(
        (child) => child.path === newFile.path,
      );
      if (fileExists) {
        return node;
      }

      const updatedChildren = [...existingChildren, newFile].sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "dir" ? -1 : 1;
        }
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });

      return {
        ...node,
        children: updatedChildren,
        isOpen: true,
      };
    }
    if (node.children) {
      return {
        ...node,
        children: addFileToDirectory(node.children, directoryPath, newFile),
      };
    }
    return node;
  });
};

export const toggleDirectoryOpen = (
  fileNodes: FileNode[],
  path: string,
): FileNode[] => {
  return fileNodes.map((node) => {
    if (node.path === path && node.type === "dir") {
      return { ...node, isOpen: !node.isOpen };
    }
    if (node.children) {
      return {
        ...node,
        children: toggleDirectoryOpen(node.children, path),
      };
    }
    return node;
  });
};

export const setDirectoryOpen = (
  fileNodes: FileNode[],
  path: string,
  isOpen: boolean,
): FileNode[] => {
  return fileNodes.map((node) => {
    if (node.path === path && node.type === "dir") {
      return { ...node, isOpen };
    }
    if (node.children) {
      return {
        ...node,
        children: setDirectoryOpen(node.children, path, isOpen),
      };
    }
    return node;
  });
};

export const renameFileNode = (
  fileNodes: FileNode[],
  oldPath: string,
  newName: string,
): FileNode[] => {
  return fileNodes.map((node) => {
    if (node.path === oldPath) {
      const pathParts = oldPath.split("/");
      pathParts[pathParts.length - 1] = newName;
      const newPath = pathParts.join("/");
      return { ...node, name: newName, path: newPath, id: newName };
    }
    if (node.children) {
      return {
        ...node,
        children: renameFileNode(node.children, oldPath, newName),
      };
    }
    return node;
  });
};

export const deleteFileNode = (
  fileNodes: FileNode[],
  pathToDelete: string,
): FileNode[] => {
  return fileNodes
    .filter((node) => node.path !== pathToDelete)
    .map((node) => {
      if (node.children) {
        return {
          ...node,
          children: deleteFileNode(node.children, pathToDelete),
        };
      }
      return node;
    });
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}