import React, { useEffect, useState } from "react";
import axios from "axios";
import './CleaningDashboard.css'; // External CSS for styling

const CleaningDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const serviceId = 1; // Cleaning Service ID

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/service-dashboard/tickets/${serviceId}`
      );
      if (Array.isArray(response.data)) {
        setTickets(response.data);
        setError("");
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      setTickets([]);
      setError(error.response?.data?.message || "Error fetching tickets.");
    }
  };

  const updateStatus = async (ticketId, newStatus) => {
    try {
      const response = await axios.put(
        `http://127.0.0.1:5000/service-dashboard/update-ticket-status/${ticketId}`,
        { status: newStatus },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        fetchTickets(); // Refresh after update
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error updating status.");
    }
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">🧹 Cleaning Service Tickets</h2>
      {error && <p className="error-message">{error}</p>}

      {tickets.length === 0 ? (
        <p className="no-tickets">No tickets available.</p>
      ) : (
        <div className="ticket-grid">
          {tickets.map((ticket) => (
            <div className="ticket-card" key={ticket.ticket_id}>
              <div className="ticket-header">
                <strong>{ticket.description}</strong>
                <span className={`ticket-status ${ticket.status.toLowerCase().replace(" ", "-")}`}>
                  {ticket.status}
                </span>
              </div>

              <div className="ticket-actions">
                <select
                  value={ticket.status}
                  onChange={(e) => updateStatus(ticket.ticket_id, e.target.value)}
                  className="status-dropdown"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <button 
                  className="view-button"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTicket && (
        <div className="ticket-details-modal">
          <h3>Ticket Details</h3>
          <p><strong>Description:</strong> {selectedTicket.description}</p>
          <p><strong>Status:</strong> {selectedTicket.status}</p>
          <p><strong>Created At:</strong> {selectedTicket.created_at}</p>

          {selectedTicket.image_path ? (
            <div className="ticket-image">
              <strong>Image:</strong>
              <img
                src={selectedTicket.image_path.startsWith("http") 
                  ? selectedTicket.image_path 
                  : `http://127.0.0.1:5000/uploads/${selectedTicket.image_path}`
                }
                alt="Ticket Image"
                onError={(e) => { e.target.src = "/fallback-image.jpg"; }} // Fallback if image fails to load
              />
            </div>
          ) : (
            <p>No image available.</p>
          )}

          <button className="close-button" onClick={() => setSelectedTicket(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default CleaningDashboard;
