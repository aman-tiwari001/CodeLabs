import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';
import IDE from './pages/IDE';
import ProtectedRoutes from './components/ProtectedRoutes';
import NotFound from './pages/NotFound';

function App() {
	return (
		<BrowserRouter>
			<Toaster />
			<Navbar />
			<Routes>
				<Route path='/' element={<LandingPage />} />
				<Route element={<ProtectedRoutes />}>
					<Route path='/home' element={<Home />} />
					<Route path='/project/:id' element={<IDE />} />
				</Route>
				<Route path='*' element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
