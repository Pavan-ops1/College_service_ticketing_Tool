import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ServiceDashboard = ({ serviceId }) => {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [newStatus, setNewStatus] = useState('');

  // Fetch tickets
  useEffect(() => {
    axios.get(`/service/${serviceId}/tickets`, {
      headers: {
        'Role': 'service_staff',  // Example role, replace with real auth token/role
        'Service-ID': serviceId,  // Your service ID
      },
    })
    .then((response) => {
      setTickets(response.data.tickets);
    })
    .catch((error) => {
      setError('Failed to fetch tickets');
    });
  }, [serviceId]);

  // Update ticket status
  const updateTicketStatus = (ticketId) => {
    axios.put(`/service/${serviceId}/tickets/${ticketId}/update`, {
      status: newStatus,
    }, {
      headers: {
        'Role': 'service_staff',  // Example role
        'Service-ID': serviceId,
      },
    })
    .then((response) => {
      alert('Ticket status updated successfully!');
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.ticket_id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );
    })
    .catch((error) => {
      alert('Failed to update ticket status');
    });
  };

  return (
    <div>
      <h1>Service Dashboard</h1>
      {error && <p>{error}</p>}
      <ul>
        {tickets.map((ticket) => (
          <li key={ticket.ticket_id}>
            <h2>{ticket.title}</h2>
            <p>{ticket.description}</p>
            <p>Status: {ticket.status}</p>
            <input
              type="text"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              placeholder="Update status"
            />
            <button onClick={() => updateTicketStatus(ticket.ticket_id)}>Update Status</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceDashboard;
