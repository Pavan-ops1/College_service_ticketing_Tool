import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:5000/login", { email, password });
      if (response.status === 200) {
        alert("✅ Login successful!");
        const { role, service_id, service_name } = response.data;

        switch (role) {
          case "student":
            navigate("/student-dashboard");
            break;
          case "admin":
            navigate("/admin-dashboard");
            break;
          case "service_staff":
            navigate(
              service_name.toLowerCase() === "cleaning"
                ? "/cleaning-dashboard"
                : service_name.toLowerCase() === "gardening"
                ? "/gardening-dashboard"
                : service_name.toLowerCase() === "it support"
                ? "/it-support-dashboard"
                : `/service/${service_id}-dashboard`
            );
            break;
          default:
            navigate("/dashboard");
        }
      }
    } catch (error) {
      setError(error.response?.data?.error || "❌ Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600">
      <div className="bg-white/30 backdrop-blur-md shadow-lg rounded-2xl p-8 max-w-md w-full transform transition-all hover:scale-105">
        <h2 className="text-4xl font-extrabold text-center mb-6 text-white drop-shadow-md">
          Welcome Back
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="flex flex-col">
            <label className="text-white mb-1 font-semibold">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border-none rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400 shadow-inner"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-1 font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-none rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400 shadow-inner"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg">
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-white mt-4">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-300 font-bold hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;