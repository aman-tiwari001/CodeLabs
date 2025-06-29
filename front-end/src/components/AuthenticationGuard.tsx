// import { useAuth0 } from '@auth0/auth0-react';
// import { Navigate, Outlet } from 'react-router-dom';

// // const ProtectedRoutes = () => {
// 	const { isAuthenticated, isLoading } = useAuth0();

// 	if (isLoading)
// 		return (
// 			<div className='h-screen flex items-center justify-center gradient'>
// 				<img
// 					src='/loader.png'
// 					alt='Loading'
// 					width={100}
// 					className='mx-auto invert animate-spin'
// 				/>
// 			</div>
// 		);

// 	return isAuthenticated ? <Outlet /> : <Navigate to='/' />;
// };

// export default ProtectedRoutes;

import { withAuthenticationRequired } from '@auth0/auth0-react';

export const AuthenticationGuard = ({
	component,
}: {
	component: React.FunctionComponent;
}) => {
	const Component = withAuthenticationRequired(component, {
		onRedirecting: () => (
			<div>
				<div className='flex items-center justify-center h-screen'>
					<img
						src='/loader.png'
						alt='Loading'
						width={100}
						className='mx-auto invert animate-spin'
					/>
				</div>
			</div>
		),
	});

	return <Component />;
};
