import React, { useEffect, useState } from "react";
import axios from "axios";

const GardeningDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const serviceId = 2; // Gardening Service ID

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
        fetchTickets(); // Refresh tickets only if update is successful
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error updating status.");
    }
  };

  return (
    <div>
      <h2>🌿 Gardening Service Tickets</h2>
      {error && <p className="error-message">{error}</p>}

      {tickets.length === 0 ? (
        <p>No tickets available.</p>
      ) : (
        <ul>
          {tickets.map((ticket) => (
            <li key={ticket.ticket_id}>
              <strong>{ticket.description}</strong> - {ticket.status}

              <select
                value={ticket.status}
                onChange={(e) => updateStatus(ticket.ticket_id, e.target.value)}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <button onClick={() => setSelectedTicket(ticket)}>View Details</button>
            </li>
          ))}
        </ul>
      )}

      {selectedTicket && (
        <div className="ticket-details-modal">
          <h3>Ticket Details</h3>
          <p><strong>Description:</strong> {selectedTicket.description}</p>
          <p><strong>Status:</strong> {selectedTicket.status}</p>
          <p><strong>Created At:</strong> {selectedTicket.created_at}</p>

          {selectedTicket.image_path ? (
            <div>
              <strong>Image:</strong>
              <img
                src={`http://127.0.0.1:5000/${selectedTicket.image_path}`}
                alt="Ticket Image"
                style={{ maxWidth: "300px", maxHeight: "300px", objectFit: "contain" }}
              />
            </div>
          ) : (
            <p>No image available.</p>
          )}

          <button onClick={() => setSelectedTicket(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default GardeningDashboard;
