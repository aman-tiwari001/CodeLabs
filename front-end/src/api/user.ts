import axiosInstance from './axios-config';

export interface UserType {
	name: string;
	email: string;
	picture: string;
	sub: string;
	authToken: string;
}

export interface ProjectType {
	name: string;
	techStack: string;
	createdAt: Date;
}

export const syncUserWithDB = async (userData: UserType) => {
	const res = await axiosInstance.post('/api/auth', userData, {
		headers: { Authorization: 'Bearer ' + userData.authToken },
	});
	return res.data;
};

export const createProject = async (projectData: ProjectType) => {
	const res = await axiosInstance.post('/api/create-project', projectData);
	return res.data;
};

export const getAllProjects = async () => {
	const res = await axiosInstance.get('/api/get-projects');
	return res.data;
};
