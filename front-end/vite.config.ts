import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	preview: {
		host: '0.0.0.0',
		allowedHosts: ['code-labs.tech'],
	},
	server: {
		allowedHosts: ['code-labs.tech'],
	},  
});
