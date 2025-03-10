import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [serviceId, setServiceId] = useState("");
  const [services, setServices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/services")
      .then((response) => setServices(response.data))
      .catch((error) => console.error("Error fetching services:", error));
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    const userData = { name, email, password, role };

    if (role === "service_staff") {
      userData.service_id = serviceId;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/register", userData);

      if (response.status === 201) {
        alert("Registration successful! 🎉 Redirecting to login...");
        navigate("/login");
      }
    } catch (error) {
      alert("❌ Error: " + (error.response?.data?.error || "Something went wrong!"));
    }
  };

  return (
    <div style={registerContainerStyle}>
      <div style={overlayStyle}>
        <h2>Register</h2>
        <form onSubmit={handleRegister} style={formStyle}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="service_staff">Service Staff</option>
            <option value="admin">Admin</option>
          </select>

          {role === "service_staff" && (
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} required>
              <option value="">Select Service</option>
              {services.map((service) => (
                <option key={service.service_id} value={service.service_id}>
                  {service.service_name}
                </option>
              ))}
            </select>
          )}

          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

// ✅ Full-screen background image like in App.js
const registerContainerStyle = {
  position: "relative",
  textAlign: "center",
  height: "100vh",
  backgroundImage: 'url("/college pic.jpg")',
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  color: "white",
};

const overlayStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  padding: "30px",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  borderRadius: "10px",
  width: "400px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
};

export default Register;
