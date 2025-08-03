import { useAuth0 } from "@auth0/auth0-react";
import { syncUserWithDB } from "../api/user";
import { useNavigate } from "react-router-dom";

const LoginButton = () => {
  const { loginWithPopup, getIdTokenClaims } = useAuth0();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await loginWithPopup();
      const loginData = await getIdTokenClaims();
      await syncUserWithDB({
        name: loginData?.name as string,
        email: loginData?.email as string,
        picture: loginData?.picture as string,
        sub: loginData?.sub as string,
        authToken: loginData?.__raw as string,
      });
      navigate("/home");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <button
      className="max-md:text-sm rounded-full px-5 py-2"
      onClick={handleLogin}
    >
      Login
    </button>
  );
};

export default LoginButton;
