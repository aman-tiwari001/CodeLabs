import { create } from "zustand";
import { Socket } from "socket.io-client";

const useSocketStore = create((set) => ({
  socket: null,
  setSocket: (socket: Socket) => set({ socket }),
}));

export default useSocketStore;
