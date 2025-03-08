import React, { useState, useEffect } from "react";
import axios from "axios";

const StudentDashboard = () => {
  const studentId = 1; // Change this to dynamic user ID if needed
  const [serviceId, setServiceId] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [tickets, setTickets] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [image, setImage] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreateTicket, setShowCreateTicket] = useState(true);

  // ✅ Fetch services for dropdown
  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/services")
      .then((response) => setServices(response.data))
      .catch((error) => console.error("Error fetching services:", error));
  }, []);

  // ✅ Fetch student tickets
  const fetchTickets = () => {
    axios
      .get(`http://127.0.0.1:5000/student-dashboard/my-tickets/${studentId}`)
      .then((response) => setTickets(response.data))
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          setTickets([]); // No tickets found, set empty array
        } else {
          console.error("Error fetching tickets:", error);
        }
      });
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // ✅ Handle Ticket Creation with Image Upload
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
        "http://127.0.0.1:5000/student-dashboard/create-ticket",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        alert("✅ Ticket Created Successfully!");
        setIssueDescription("");
        setImage(null);
        fetchTickets();
      }
    } catch (error) {
      console.error("API Error:", error.response ? error.response.data : error);
      setError("❌ Error creating ticket. Check logs.");
    }
  };

  // ✅ Handle view details of a ticket
  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
  };

  // ✅ Close the ticket details modal
  const handleCloseDetails = () => {
    setSelectedTicket(null);
  };

  // ✅ Toggle between Create Ticket and My Tickets view
  const toggleView = () => {
    setShowCreateTicket(!showCreateTicket);
  };

  return (
    <div className="dashboard-container">
      <h2>🎓 Student Dashboard</h2>

      {/* Toggle between Create Ticket and My Tickets */}
      <div className="view-toggle">
        <button onClick={toggleView}>
          {showCreateTicket ? "View My Tickets" : "Create Ticket"}
        </button>
      </div>

      {/* ✅ Create Ticket Form */}
      {showCreateTicket && (
        <div className="ticket-form">
          <h3>Create Ticket</h3>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleCreateTicket}>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              required
            >
              <option value="">Select Service</option>
              {services.map((service) => (
                <option key={service.service_id} value={service.service_id}>
                  {service.service_name}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Describe your issue..."
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              required
            />
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              accept="image/*"
            />
            <button type="submit">Submit Ticket</button>
          </form>
        </div>
      )}

      {/* ✅ Display Tickets */}
      {!showCreateTicket && (
        <div className="tickets-list">
          <h3>📋 My Tickets</h3>
          {tickets.length === 0 ? (
            <p>No tickets found.</p>
          ) : (
            <ul>
              {tickets.map((ticket) => (
                <li key={ticket.ticket_id}>
                  <strong>Service:</strong>{" "}
                  {services.find((s) => s.service_id === ticket.service_id)
                    ?.service_name || "Unknown"}{" "}
                  | <strong> Issue:</strong> {ticket.description} |{" "}
                  <strong> Status:</strong> {ticket.status} |{" "}
                  <strong> Created:</strong> {ticket.created_at}
                  <button onClick={() => handleViewDetails(ticket)}>
                    View Details
                  </button>

                  {/* Render Image Preview (If Image Exists) */}
                  {ticket.image_url && (
                    <div>
                      <img
                        src={ticket.image_url}
                        alt="Ticket Image"
                        style={{
                          maxWidth: "100px",
                          maxHeight: "100px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ✅ View Ticket Details Modal */}
      {selectedTicket && (
        <div className="ticket-details-modal">
          <h3>Ticket Details</h3>
          <p>
            <strong>Service:</strong>{" "}
            {services.find((s) => s.service_id === selectedTicket.service_id)
              ?.service_name || "Unknown"}
          </p>
          <p>
            <strong>Issue Description:</strong> {selectedTicket.description}
          </p>
          <p>
            <strong>Status:</strong> {selectedTicket.status}
          </p>
          <p>
            <strong>Created At:</strong> {selectedTicket.created_at}
          </p>
          {selectedTicket.image_url && (
            <div>
              <strong>Image:</strong>
              <img
                src={selectedTicket.image_url}
                alt="Ticket Image"
                style={{
                  maxWidth: "300px",
                  maxHeight: "300px",
                  objectFit: "contain",
                }}
              />
            </div>
          )}
          <button onClick={handleCloseDetails}>Close</button>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
