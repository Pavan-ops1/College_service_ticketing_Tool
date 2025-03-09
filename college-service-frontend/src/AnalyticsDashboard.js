import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

// Registering Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = ({ title, data, type }) => {
  if (!data || !data.labels || !data.values) {
    return <div>Loading...</div>;
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: title,
        data: data.values,
        backgroundColor: data.backgroundColor || '#42A5F5',
        borderColor: data.borderColor || '#1E88E5',
        borderWidth: 1,
      },
    ],
  };

  if (type === 'bar') {
    return <Bar data={chartData} />;
  } else if (type === 'pie') {
    return <Pie data={chartData} />;
  } else if (type === 'line') {
    return <Line data={chartData} />;
  }
  return null;
};

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:5000/admin-dashboard/data-analytics') // Update this with your actual backend URL
      .then((response) => {
        console.log(response.data); // Check the structure of the response data
        setData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  // Dashboard 1: Number of Tickets Each Service is Having
  const overallServiceData = {
    labels: data?.tickets_per_service?.map((item) => item.service_name) || [],
    values: data?.tickets_per_service?.map((item) => item.count) || [],
    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
  };

  // Dashboard 2: Each Service Status Dashboard (Including IT Support Service Status)
  const serviceStatusData = data?.status_distribution_per_service?.map((serviceData) => ({
    service_name: serviceData.service_name,
    labels: serviceData.statuses?.map((status) => status.status) || [],
    values: serviceData.statuses?.map((status) => status.count) || [],
  })) || [];

  // Dashboard 3: Service Status and Ticket Info for All Services
  const serviceAndStatusData = {
    labels: data?.tickets_per_service?.map((item) => item.service_name) || [],
    values: data?.tickets_per_service?.map((item) => item.count) || [],
  };

  // Dashboard 4: Tickets Per Week (Bar Chart)
  const ticketsPerWeekData = {
    labels: data?.tickets_per_week?.map((item) => item.week) || [],
    values: data?.tickets_per_week?.map((item) => item.count) || [],
  };

  // Dashboard 5: Tickets Per Month (Bar Chart)
  const ticketsPerMonthData = {
    labels: data?.tickets_per_month?.map((item) => item.month) || [],
    values: data?.tickets_per_month?.map((item) => item.count) || [],
  };

  // Dashboard 6: Tickets Per Day (Line Chart)
  const ticketsPerDayData = {
    labels: data?.tickets_per_day?.map((item) => item.date) || [],
    values: data?.tickets_per_day?.map((item) => item.count) || [],
  };

  // Percentage of Status for Each Service
  const percentageStatusData = data?.status_distribution_per_service?.map((serviceData) => ({
    service_name: serviceData.service_name,
    statusPercentages: serviceData.statuses?.map((status) => ({
      status: status.status,
      percentage: (status.count / serviceData.statuses.reduce((total, s) => total + s.count, 0)) * 100,
    })) || [],
  })) || [];

  return (
    <div>
      <h2>📊 Analytics Dashboard</h2>

      {/* 4x4 Grid Layout */}
      <div style={gridContainerStyle}>

        {/* Tickets per Service */}
        <div style={gridItemStyle}>
          <h3>Tickets Per Service</h3>
          <Dashboard title="Tickets Per Service" data={overallServiceData} type="pie" />
        </div>

        {/* Service Status Dashboards (Including IT Support Service Status) */}
        {serviceStatusData.map((serviceData, index) => (
          <div key={index} style={gridItemStyle}>
            <h3>{`Service: ${serviceData.service_name} Status`}</h3>
            <Dashboard
              title={`Service: ${serviceData.service_name} Status`}
              data={{
                labels: serviceData.labels,
                values: serviceData.values,
                backgroundColor: ['#FF5733', '#33FF57'],
              }}
              type="bar" // This ensures the bar chart is rendered
            />
          </div>
        ))}

        {/* Service Status and Ticket Info */}
        <div style={gridItemStyle}>
          <h3>Service Status and Tickets Info</h3>
          <Dashboard title="Service and Status Comparison" data={serviceAndStatusData} type="pie" />
        </div>

        {/* Tickets Per Week */}
        <div style={gridItemStyle}>
          <h3>Tickets Per Week</h3>
          <Dashboard title="Tickets Per Week" data={ticketsPerWeekData} type="bar" />
        </div>

        {/* Tickets Per Month */}
        <div style={gridItemStyle}>
          <h3>Tickets Per Month</h3>
          <Dashboard title="Tickets Per Month" data={ticketsPerMonthData} type="bar" />
        </div>

        {/* Tickets Per Day */}
        <div style={gridItemStyle}>
          <h3>Tickets Per Day</h3>
          <Dashboard title="Tickets Per Day" data={ticketsPerDayData} type="line" />
        </div>

        {/* Percentage of Status */}
        <div style={gridItemStyle}>
          <h3>Status Percentage Breakdown</h3>
          <div style={pieChartsContainerStyle}>
            {percentageStatusData.map((serviceData, index) => (
              <div key={index} style={pieChartWrapperStyle}>
                <h4>{serviceData.service_name}</h4>
                <Pie
                  data={{
                    labels: serviceData.statusPercentages.map((item) => item.status),
                    datasets: [
                      {
                        data: serviceData.statusPercentages.map((item) => item.percentage),
                        backgroundColor: ['#FF5733', '#33FF57', '#FFCE56'],
                      },
                    ],
                  }}
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// Styles for Grid Layout
const gridContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)', // 4 columns
  gridGap: '16px', // Space between grid items
  marginTop: '20px',
};

const gridItemStyle = {
  backgroundColor: '#f4f4f4',
  padding: '16px',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
};

// Styles for Pie Charts Section (Updated)
const pieChartsContainerStyle = {
  display: 'flex', // Flexbox to align the pie charts side by side in a row
  justifyContent: 'space-between', // Distribute space evenly between charts
  flexWrap: 'wrap', // Allow wrapping if there's not enough space on one row
  gap: '16px', // Add some gap between the charts
};

// Styles for individual Pie Chart Wrappers (Updated)
const pieChartWrapperStyle = {
  flex: '1 1 22%', // Make each pie chart take up 22% of the width (this will give space for 4 charts in one row)
  margin: '10px', // Space between pie charts
  textAlign: 'center',
  backgroundColor: '#fff',
  padding: '10px',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
};

export default AnalyticsDashboard;
