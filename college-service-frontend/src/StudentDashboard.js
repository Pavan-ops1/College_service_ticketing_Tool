import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const [studentId, setStudentId] = useState(null);
  const [serviceId, setServiceId] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [tickets, setTickets] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [image, setImage] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreateTicket, setShowCreateTicket] = useState(true);

  useEffect(() => {
    const loggedInUserId = localStorage.getItem("user_id");
    if (loggedInUserId) {
      setStudentId(loggedInUserId);
    } else {
      setError("❌ User not logged in. Please log in again.");
    }
  }, []);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/services")
      .then((response) => setServices(response.data))
      .catch(() => setError("❌ Failed to fetch services. Try again later."));
  }, []);

  const fetchTickets = () => {
    if (!studentId) return;
    axios.get(`http://127.0.0.1:5000/student-dashboard/my-tickets/${studentId}`)
      .then((response) => setTickets(response.data))
      .catch(() => setError("❌ Failed to fetch tickets. Try again later."));
  };

  useEffect(() => {
    if (studentId) {
      fetchTickets();
    }
  }, [studentId]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setError("");
    if (!serviceId || !issueDescription) {
      setError("❌ All fields are required.");
      return;
    }
    const formData = new FormData();
    formData.append("user_id", studentId);
    formData.append("service_id", serviceId);
    formData.append("description", issueDescription);
    if (image) {
      formData.append("image", image);
    }
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/student-dashboard/create-ticket", formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (response.status === 200) {
        alert("✅ Ticket Created Successfully!");
        setIssueDescription("");
        setImage(null);
        setServiceId("");
        fetchTickets();
      }
    } catch (error) {
      setError("❌ Error creating ticket. Please check the logs.");
    }
  };

  return (
    <div className="dashboard-container">
      <h2>🎓 Student Dashboard</h2>
      {studentId ? (
        <>
          <div className="view-toggle">
            <button onClick={() => setShowCreateTicket(!showCreateTicket)}>
              {showCreateTicket ? "View My Tickets" : "Create Ticket"}
            </button>
          </div>
          {showCreateTicket ? (
            <div className="ticket-form">
              <h3>Create Ticket</h3>
              {error && <p className="error">{error}</p>}
              <form onSubmit={handleCreateTicket}>
                <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} required>
                  <option value="">Select Service</option>
                  {services.map((service) => (
                    <option key={service.service_id} value={service.service_id}>
                      {service.service_name}
                    </option>
                  ))}
                </select>
                <textarea placeholder="Describe your issue..." value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} required />
                <input type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/*" />
                <button type="submit">Submit Ticket</button>
              </form>
            </div>
          ) : (
            <div className="tickets-list">
              <h3>📋 My Tickets</h3>
              {tickets.length === 0 ? (
                <p>No tickets found.</p>
              ) : (
                <ul>
                  {tickets.map((ticket) => (
                    <li key={ticket.ticket_id} className="ticket-item">
                      <strong>Service:</strong> {services.find((s) => s.service_id === ticket.service_id)?.service_name || "Unknown"} | 
                      <strong>Status:</strong> 
                      <span className={`status-${ticket.status.toLowerCase()}`}>
                        {ticket.status}
                      </span>
                      <button className="view-btn" onClick={() => setSelectedTicket(ticket)}>View Details</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {selectedTicket && (
            <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>📝 Ticket Details</h3>
                <p><strong>Service:</strong> {services.find((s) => s.service_id === selectedTicket.service_id)?.service_name || "Unknown"}</p>
                <p><strong>Description:</strong> {selectedTicket.description}</p>
                <p><strong>Status:</strong> <span className={`status-${selectedTicket.status.toLowerCase()}`}>{selectedTicket.status}</span></p>
                {selectedTicket.image_url ? (
                  <div>
                    <strong>Image:</strong>
                    <img
                      src={`http://127.0.0.1:5000/${selectedTicket.image_url}`}
                      alt="Ticket Image"
                      style={{ maxWidth: "300px", maxHeight: "300px", objectFit: "contain" }}
                    />
                  </div>
                ) : (
                  <p>No image attached.</p>
                )}
                <button className="close-btn" onClick={() => setSelectedTicket(null)}>Close</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="error">❌ Please log in to access the dashboard.</p>
      )}
    </div>
  );
};

export default StudentDashboard;
