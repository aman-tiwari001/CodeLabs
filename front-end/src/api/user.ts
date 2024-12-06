import axios from 'axios';

export interface UserDataType {
	name: string;
	email: string;
	picture: string;
	sub: string;
}

export const syncUserWithDB = async (userData: UserDataType) => {
	const res = await axios.post(import.meta.env.VITE_SERVER_URL+'/api/auth', userData, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: localStorage.getItem('token'),
		},
	});
	return res.data;
};
