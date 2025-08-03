import { create } from "zustand";
import { FileNode } from "../types/index";

const useFileStore = create((set) => ({
  files: [] as FileNode[],
  setFiles: (files: FileNode[]) => set({ files }),
}));

export default useFileStore;
