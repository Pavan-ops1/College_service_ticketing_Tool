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
        const { user_id, role, service_id, service_name } = response.data;

        // Store user_id in localStorage
        localStorage.setItem("user_id", user_id);
        localStorage.setItem("role", role);

        switch (role) {
          case "student":
            navigate("/student-dashboard");
            break;
          case "admin":
            navigate("/admin-dashboard");
            break;
          case "service_staff":
            navigate(
              service_name?.toLowerCase() === "cleaning"
                ? "/cleaning-dashboard"
                : service_name?.toLowerCase() === "gardening"
                ? "/gardening-dashboard"
                : service_name?.toLowerCase() === "it support"
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
    <div style={loginStyle}>
      <div style={overlayStyle}>
        <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem", color: "white" }}>
          Welcome Back
        </h2>
        {error && <p style={{ color: "red", fontSize: "0.9rem", marginBottom: "1rem" }}>{error}</p>}

        <form onSubmit={handleLogin} style={{ width: "100%" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: "white" }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="Enter your email"
              required
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: "white" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" style={buttonStyle}>Sign In</button>
        </form>

        <p style={{ color: "white", marginTop: "1rem" }}>
          Don't have an account?{' '}
          <a href="/register" style={{ color: "#61dafb" }}>Register here</a>
        </p>
      </div>
    </div>
  );
};

const loginStyle = {
  position: "relative",
  textAlign: "center",
  height: "100vh",
  backgroundImage: 'url("/college pic.jpg")',
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const overlayStyle = {
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  padding: "2rem",
  borderRadius: "10px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "5px",
  border: "none",
  outline: "none",
  marginTop: "5px",
};

const buttonStyle = {
  backgroundColor: "#4CAF50",
  color: "white",
  padding: "10px 15px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "0.3s",
};

export default Login;
