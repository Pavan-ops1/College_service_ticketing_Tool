import React, { useState, useEffect } from "react";
import axios from "axios"; 
import './AdminDashboard.css';


const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // ✅ Service Images
  const serviceImages = {
    "Cleaning": "/images/cleaning.png",
    "Gardening": "/images/gardening.png",
    "IT Support": "/images/it_support.png",
  };

  // ✅ Fetch Tickets from Flask API
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:5000/admin-dashboard/tickets");
      setTickets(response.data);
      setFilteredTickets(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("❌ Unable to fetch tickets. Please try again later.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // ✅ Handle Status Update
  const handleStatusUpdate = async (ticketId) => {
    if (!statusUpdate) {
      setError("❌ Please select a status.");
      return;
    }

    try {
      const response = await axios.put(`http://127.0.0.1:5000/admin/update-ticket/${ticketId}`, {
        status: statusUpdate,
        service_type: selectedTicket.service_name,
        description: selectedTicket.description,
      });

      if (response.status === 200) {
        alert("✅ Ticket status updated successfully!");
        fetchTickets();
        setSelectedTicket(null);
        setStatusUpdate("");
      }
    } catch (err) {
      console.error("Error updating ticket:", err);
      setError("❌ Failed to update status.");
    }
  };

  // ✅ Handle Search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    filterTickets(e.target.value, serviceFilter, dateRange);
  };

  // ✅ Handle Service Filter
  const handleServiceFilter = (e) => {
    setServiceFilter(e.target.value);
    filterTickets(searchQuery, e.target.value, dateRange);
  };

  // ✅ Handle Date Range Filter
  const handleDateFilter = (e) => {
    const { name, value } = e.target;
    setDateRange({ ...dateRange, [name]: value });
    filterTickets(searchQuery, serviceFilter, { ...dateRange, [name]: value });
  };

  // ✅ Filter Tickets Based on Criteria
  const filterTickets = (search, service, date) => {
    let filtered = tickets;

    if (search) {
      filtered = filtered.filter(ticket =>
        ticket.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (service) {
      filtered = filtered.filter(ticket => ticket.service_name === service);
    }
    if (date.start && date.end) {
      filtered = filtered.filter(ticket => {
        const ticketDate = new Date(ticket.created_at);
        return ticketDate >= new Date(date.start) && ticketDate <= new Date(date.end);
      });
    }
    setFilteredTickets(filtered);
  };

  // ✅ View Ticket Details
  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
  };

  // ✅ Close Modal
  const handleCloseDetails = () => {
    setSelectedTicket(null);
  };

  return (
    <div className="admin-dashboard">
      <h2 className="title">🛠️ Admin Dashboard</h2>

      {/* Filters & Search */}
      <div className="filters">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search tickets..."
          value={searchQuery}
          onChange={handleSearch}
        />
        <select className="service-filter" onChange={handleServiceFilter} value={serviceFilter}>
          <option value="">All Services</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Gardening">Gardening</option>
          <option value="IT Support">IT Support</option>
        </select>
        <input
          type="date"
          className="date-filter"
          name="start"
          onChange={handleDateFilter}
          value={dateRange.start}
        />
        <input
          type="date"
          className="date-filter"
          name="end"
          onChange={handleDateFilter}
          value={dateRange.end}
        />
      </div>

      {/* Error Message */}
      {error && <p className="error-message">{error}</p>}

      {/* Loading Indicator */}
      {loading ? (
        <p className="loading">⏳ Loading tickets...</p>
      ) : (
        <div className="ticket-grid">
          {filteredTickets.length === 0 ? (
            <p>No tickets found.</p>
          ) : (
            filteredTickets.map((ticket) => (
              <div key={ticket.ticket_id} className="ticket-card">
                <img
                  className="service-icon"
                  src={serviceImages[ticket.service_name]}
                  alt={ticket.service_name}
                  width="60"
                  height="60"
                />
                <div>
                  <strong>Service:</strong> {ticket.service_name}
                  <br />
                  <strong>Status:</strong> {ticket.status}
                  <br />
                  <strong>Created:</strong> {ticket.created_at}
                </div>
                <button
                  className="view-details-btn"
                  onClick={() => handleViewDetails(ticket)}
                >
                  View Details
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="ticket-details-modal">
          <h3>Ticket Details</h3>
          <div className="ticket-details">
            <img
              src={serviceImages[selectedTicket.service_name]}
              alt={selectedTicket.service_name}
              width="100"
              height="100"
            />
            <p><strong>Service:</strong> {selectedTicket.service_name}</p>
            <p><strong>Issue:</strong> {selectedTicket.description}</p>
            <p><strong>Status:</strong> {selectedTicket.status}</p>

            <select
              value={statusUpdate}
              onChange={(e) => setStatusUpdate(e.target.value)}
            >
              <option value="">Update Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <button
              className="update-btn"
              onClick={() => handleStatusUpdate(selectedTicket.ticket_id)}
            >
              Update Status
            </button>

            <button className="close-modal-btn" onClick={handleCloseDetails}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
