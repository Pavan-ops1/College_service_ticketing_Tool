import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      const response = await axios.post("http://127.0.0.1:5000/login", { email, password });

      if (response.status === 200) {
        alert("✅ Login successful!");

        const { role, service_id, service_name } = response.data; // Extract role & service details

        // 🔥 Redirect based on role & service
        if (role === "student") {
          navigate("/student-dashboard");
        } else if (role === "admin") {
          navigate("/admin-dashboard");
        } else if (role === "service_staff") {
          // Redirect based on service name
          if (service_name && service_name.toLowerCase() === "cleaning") {
            navigate("/cleaning-dashboard");
          } else if (service_name && service_name.toLowerCase() === "gardening") {
            navigate("/gardening-dashboard");
          } else if (service_name && service_name.toLowerCase() === "it support") {
            navigate("/it-support-dashboard");
          } else {
            navigate(`/service/${service_id}-dashboard`); // Generic service-based dashboard
          }
        } else {
          navigate("/dashboard"); // Fallback
        }
      }
    } catch (error) {
      setError(error.response?.data?.error || "❌ Invalid email or password");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
