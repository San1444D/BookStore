  import React, { useState, useEffect, useContext } from "react";
  import { assets } from "../assets/assets";
  import { AppContext } from "../context/AppContext";
  import { toast } from "react-toastify";
  import axios from "axios";
  import { motion } from "motion/react";
  import Sliding from "./sliding.jsx";
import { useNavigate } from "react-router-dom";

  const Login = () => {
    const [state, setState] = useState("Login");
    const navigate = useNavigate();
    const { setShowLogin, backendUrl, setToken, setUser } =
      useContext(AppContext);

    // "User" | "Admin" | "Seller" from UI, convert to lowercase when sending
    const [role, setRole] = useState("User");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const apiRole = role.toLowerCase(); // "user" | "admin" | "seller"

    const onSubmitHandler = async (e) => {
      e.preventDefault();
      try {
        if (state === "Login") {
          const { data } = await axios.post(`${backendUrl}api/auth/login`, {
            email,
            password,
            role: apiRole,
          });

          console.log("LOGIN RESPONSE", data);

          // expect: { message, token, role, user }
          if (!data.token) {
            toast.error(data.message || "Login failed");
            return;
          }

          setToken(data.token);
          setUser({ ...data.user, role: data.role });
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.role);
          localStorage.setItem(
            "user",
            JSON.stringify({ ...data.user, role: data.role })
          );

          setShowLogin(false);
          toast.success("Logged in successfully");

          // use backend role (already normalized)
          if (data.role === "admin") navigate("/admin");
          else if (data.role === "seller") navigate("/seller");
          else navigate("/");
        } else {
          const { data } = await axios.post(`${backendUrl}api/auth/signup`, {
            name,
            email,
            password,
            role: apiRole,
          });

          if (!data.token && !data.user) {
            // signup might or might not auto‑login, handle both
            if (data.message) toast.success(data.message);
            else toast.success("Account created successfully");
            setState("Login");
            return;
          }

          // if you want auto‑login after signup:
          setToken(data.token);
          setUser({ ...data.user, role: data.role });
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.role);
          setShowLogin(false);
          toast.success("Account created successfully");

          if (data.role === "ADMIN") window.location.href = "/admin";
          else if (data.role === "SELLER") window.location.href = "/seller";
          else window.location.href = "/";
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    };

    useEffect(() => {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }, []);

    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 z-999 backdrop-blur-sm bg-black/30 flex justify-center items-center">
        <motion.form
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={onSubmitHandler}
          className="relative bg-white p-10! rounded-xl text-slate-500 w-[350px]"
        >
          <h1 className="text-center text-2xl font-medium">{state}</h1>
          <p className="text-sm text-center mt-1!">
            {state === "Login" ? "Welcome back!" : "Please sign up to continue"}
          </p>
          {state !== "Login" && (
            <div className="border border-gray-300 px-5! py-2! rounded-full flex items-center gap-2! mt-5!">
              <img src={assets.person_icon} />
              <input
                onChange={(e) => setName(e.target.value)}
                type="text"
                required
                className="outline-none text-sm w-full"
                placeholder="Full Name"
              />
            </div>
          )}
          <div className="border border-gray-300 px-5! py-2! rounded-full flex items-center gap-2! mt-4!">
            <img src={assets.mail_icon} />
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="outline-none text-sm w-full"
              placeholder="Email"
              required
            />
          </div>
          <div className="border border-gray-300 px-5! py-2! rounded-full flex items-center gap-2! mt-4!">
            <img src={assets.lock_icon} />
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="outline-none text-sm w-full"
              placeholder="Password"
              required
            />
          </div>

          {/* Role slider*/}
          <Sliding value={role} onChange={setRole} />

          {/* forget password  */}
          {state == "Login" ? (
            <p className="text-sm text-primary-btn my-1! cursor-pointer">
              {" "}
              Forgot password?{" "}
            </p>
          ) : null}

          <button className="bg-primary-btn text-white w-full py-2! rounded-full mt-6! hover:scale-105 transition cursor-pointer">
            {state === "Login" ? "Login" : "Create Account"}
          </button>
          <p className="text-center text-sm mt-4!">
            {state === "Login" ? (
              <>
                Don't have an account?{" "}
                <span
                  className="text-primary-btn text-xl cursor-pointer"
                  onClick={() => setState("Sign Up")}
                >
                  SignUp
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span
                  className="text-primary-btn text-xl cursor-pointer"
                  onClick={() => setState("Login")}
                >
                  Login
                </span>
              </>
            )}
          </p>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.close_icon}
            className="absolute top-5 right-5 cursor-pointer"
          />
        </motion.form>
      </div>
    );
  };

  export default Login;
