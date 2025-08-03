import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import IDE from "./pages/IDE";
import NotFound from "./pages/NotFound";
import { AuthenticationGuard } from "./components/AuthenticationGuard";

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/home"
          element={<AuthenticationGuard component={Home} />}
        />
        <Route
          path="/project/:id"
          element={<AuthenticationGuard component={IDE} />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
