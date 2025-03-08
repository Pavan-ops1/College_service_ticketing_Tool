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
      <nav>
        <Link to="/">Home</Link> | 
        <Link to="/register">Register</Link> | 
        <Link to="/login">Login</Link> | 
        
      </nav>

      <Routes>
        <Route path="/" element={<Home message={message} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} /> 
        <Route path="/student-dashboard/create-ticket" element={<CreateTicket />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/cleaning-dashboard" element={<CleaningDashboard />} />
        <Route path="/gardening-dashboard" element={<GardeningDashboard />} />
        <Route path="/it-support-dashboard" element={<ITSupportDashboard />} />
      </Routes>
    </Router>
  );
}

// ✅ Ensure `Home` is defined before exporting `App`
const Home = ({ message }) => (
  <div>
    <h1>College Service Ticketing Tool 🎟️</h1>
    <p>{message}</p>
  </div>
);

export default App;
