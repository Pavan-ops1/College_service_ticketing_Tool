import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Register from "./Register";
import Login from "./Login";
import StudentDashboard from "./StudentDashboard";
import CreateTicket from "./CreateTicket";
import CleaningDashboard from "./CleaningDashboard";
import GardeningDashboard from "./GardeningDashboard";
import ITSupportDashboard from "./ITSupportDashboard";
import AdminDashboard from "./AdminDashboard";
import AnalyticsDashboard from './AnalyticsDashboard';

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/") // 🔥 Use 'localhost' instead of '127.0.0.1'
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch data from backend");
        }
        return response.json();
      })
      .then((data) => setMessage(data.message))
      .catch((error) => {
        console.error("Error fetching data:", error);
        setMessage("⚠️ Backend not responding. Please check Flask server.");
      });
  }, []);

  return (
    <Router>
      <nav style={navStyle}>
        <Link to="/" style={linkStyle}>Home</Link> | 
        <Link to="/register" style={linkStyle}>Register</Link> | 
        <Link to="/login" style={linkStyle}>Login</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home message={message} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} /> 
        <Route path="/student-dashboard/create-ticket" element={<CreateTicket />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/data-analytics" element={<AnalyticsDashboard />} />
        <Route path="/cleaning-dashboard" element={<CleaningDashboard />} />
        <Route path="/gardening-dashboard" element={<GardeningDashboard />} />
        <Route path="/it-support-dashboard" element={<ITSupportDashboard />} />
      </Routes>
    </Router>
  );
}

// ✅ Home Component with Image as Full Background
const Home = ({ message }) => (
  <div style={homeStyle}>
    <div style={overlayStyle}>
      <h1>🎓 College Service Ticketing Tool 🎟️</h1>
      <p>{message}</p>
      <p style={{ marginTop: "10px" }}>We are here to solve your problems!</p>
    </div>
  </div>
);

// ✅ Simple CSS for styling
const navStyle = {
  backgroundColor: "#282c34",
  padding: "15px",
  textAlign: "center"
};

const linkStyle = {
  color: "#61dafb",
  textDecoration: "none",
  margin: "0 15px",
  fontWeight: "bold"
};

// Styling for the Home page with full-screen background image
const homeStyle = {
  position: "relative",
  textAlign: "center",
  height: "100vh", // Full viewport height
  backgroundImage: 'url("/college pic.jpg")', // The background image
  backgroundSize: "cover", // Make sure the image covers the entire screen
  backgroundPosition: "center", // Center the image
  backgroundRepeat: "no-repeat", // Prevent the image from repeating
  color: "white", // Text color for contrast
};

const overlayStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)", // Center the text
  padding: "20px",
  backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background for the text
  borderRadius: "10px",
};

export default App;
