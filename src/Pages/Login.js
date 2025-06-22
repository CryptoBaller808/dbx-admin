import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import Spinner from "../components/Spinner/Spinner";
import { ToastContainer, toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, setIsLoading, setCurrentUser } = useAuthContext();

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await login(email, password);
      const data = res.data;
      console.log(data);
      setCurrentUser(data?.access_token);
      localStorage.setItem("access_token", data?.access_token);
      setIsLoading(false);
    } catch (e) {
      console.log("login error===>", e);
      setIsLoading(false);
      setEmail("");
      setPassword("");
      toast.error("Wrong Credentials", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {isLoading && <Spinner />}
      <div className="login-container">
        <div className="flex items-center mt-8 w-full">
          <div className="w-full bg-white rounded shadow-lg p-8 m-4 md:max-w-sm md:mx-auto">
            <span className="block w-full text-xl uppercase font-bold mb-4">
              Login
            </span>
            <form className="mb-4" onSubmit={handleSubmit}>
              <div className="mb-4 md:w-full">
                <input
                  className="w-full border rounded p-2 outline-none focus:shadow-outline"
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6 md:w-full">
                <input
                  className="w-full border rounded p-2 outline-none focus:shadow-outline"
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white uppercase text-sm w-full font-semibold px-4 py-2 rounded"
              >
                {isLoading ? "Loading..." : "Login"}
              </button>
            </form>
            <Link to="forget" className="text-blue-700 text-center text-sm ">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
