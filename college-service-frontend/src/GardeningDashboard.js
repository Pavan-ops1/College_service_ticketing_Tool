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
    <div className="container">
      <h2>🌿 Gardening Service Tickets</h2>
      {error && <p className="error-message">{error}</p>}

      {tickets.length === 0 ? (
        <p>No tickets available.</p>
      ) : (
        <div className="grid-container">
          {tickets.map((ticket) => (
            <div className="ticket-card" key={ticket.ticket_id}>
              <img
                src={ticket.image_url}
                alt="Ticket Image"
                className="ticket-image"
              />
              <strong>{ticket.description}</strong>
              <p>Status: {ticket.status}</p>

              <select
                value={ticket.status}
                onChange={(e) => updateStatus(ticket.ticket_id, e.target.value)}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <button onClick={() => setSelectedTicket(ticket)}>View Details</button>
            </div>
          ))}
        </div>
      )}

      {selectedTicket && (
        <div className="ticket-details-modal">
          <h3>Ticket Details</h3>
          <img
            src={selectedTicket.image_url}
            alt="Ticket Image"
            className="ticket-image-large"
          />
          <p><strong>Description:</strong> {selectedTicket.description}</p>
          <p><strong>Status:</strong> {selectedTicket.status}</p>
          <p><strong>Created At:</strong> {selectedTicket.created_at}</p>

          <button onClick={() => setSelectedTicket(null)}>Close</button>
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 20px auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .grid-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .ticket-card {
          background-color: #f9f9f9;
          border: 1px solid #e0e0e0;
          border-radius: 5px;
          padding: 15px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .ticket-card img {
          max-width: 100%;
          max-height: 150px;
          border-radius: 5px;
        }

        .ticket-card:hover {
          background-color: #e8f5e9;
          transform: scale(1.05);
        }

        select {
          margin: 10px 0;
          padding: 8px;
          border-radius: 5px;
        }

        button {
          background-color: #2c7a37;
          color: #fff;
          padding: 8px 15px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        button:hover {
          background-color: #1e5725;
        }

        .ticket-details-modal {
          position: fixed;
          top: 20%;
          left: 50%;
          transform: translate(-50%, -20%);
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          padding: 20px;
          z-index: 1000;
          width: 400px;
        }

        .ticket-image-large {
          max-width: 100%;
          max-height: 300px;
          border-radius: 5px;
        }

        @media (max-width: 768px) {
          .grid-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default GardeningDashboard;