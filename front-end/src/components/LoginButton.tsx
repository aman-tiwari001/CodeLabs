import { useAuth0 } from '@auth0/auth0-react';
import { syncUserWithDB } from '../api/user';

const LoginButton = () => {
	const { loginWithPopup, getIdTokenClaims } = useAuth0();

	const handleLogin = async () => {
		try {
			console.log('hey in side this func');
			await loginWithPopup();
			const loginData = await getIdTokenClaims();
			console.log(loginData);
			const res = await syncUserWithDB({
				name: loginData?.name as string,
				email: loginData?.email as string,
				picture: loginData?.picture as string,
				sub: loginData?.sub as string,
			});
      console.log(res);
      alert('login success ✅🚀')
		} catch (error) {
			console.log(error);
		}
	};

	return <button onClick={handleLogin}>Log In</button>;
};

export default LoginButton;
