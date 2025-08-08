import axios from "axios";

export const server = import.meta.env.VITE_SERVER_URL;
const axiosInstance = axios.create({
  baseURL: `${server}`,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
  withCredentials: true,
});

export default axiosInstance;
