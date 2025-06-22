import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

const formatDate = (dateString) => {
  const year = dateString.slice(0, 4); // Extract the year
  const month = dateString.slice(4, 6); // Extract the month
  const day = dateString.slice(6, 8); // Extract the day

  // Create a Date object
  const date = new Date(`${year}-${month}-${day}`);

  // Format the date as "MMM DD, YYYY" (e.g., "Jan 12, 2025")
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function DataChart({
  data,
  hideNewUsers = false,
  hideOnlineUsers = false,
  hidePageViews = false,
  hideSessionDuration = false,
  colors = {}, // New prop for custom colors
}) {
  // Pagination setup
  const itemsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on props
  const filteredData = data.filter((entry) => {
    return (
      (!hideNewUsers || entry.newUsers !== 0) &&
      (!hideOnlineUsers || entry.onlineUsers !== 1) &&
      (!hidePageViews || entry.pageViews !== 2) &&
      (!hideSessionDuration || entry.sessionDuration !== 1338.464879)
    );
  });

  // Pagination logic: Slice data for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Extract x and y data for each line
  const labels = paginatedData.map((entry) => formatDate(entry.date));
  const pageViewsData = paginatedData.map((entry) => entry.pageViews);
  const newUsersData = paginatedData.map((entry) => entry.newUsers);
  const onlineUsersData = paginatedData.map((entry) => entry.onlineUsers);
  const sessionDurationData = paginatedData.map((entry) => entry.sessionDuration);

  const datasets = [];

  // Add datasets conditionally based on props
  if (!hidePageViews) {
    datasets.push({
      label: "Page Views",
      data: pageViewsData,
      borderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.3,
      borderColor: colors.pageViews || "rgba(75,192,192,1)",
      backgroundColor: colors.pageViews || "rgba(75,192,192,0.2)",
    });
  }

  if (!hideNewUsers) {
    datasets.push({
      label: "New Users",
      data: newUsersData,
      borderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.3,
      borderColor: colors.newUsers || "rgba(153,102,255,1)",
      backgroundColor: colors.newUsers || "rgba(153,102,255,0.2)",
    });
  }

  if (!hideOnlineUsers) {
    datasets.push({
      label: "Online Users",
      data: onlineUsersData,
      borderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.3,
      borderColor: colors.onlineUsers || "rgba(255,159,64,1)",
      backgroundColor: colors.onlineUsers || "rgba(255,159,64,0.2)",
    });
  }

  if (!hideSessionDuration) {
    datasets.push({
      label: "Session Duration",
      data: sessionDurationData,
      borderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.3,
      borderColor: colors.sessionDuration || "rgba(255,99,132,1)",
      backgroundColor: colors.sessionDuration || "rgba(255,99,132,0.2)",
    });
  }

  const maxValue = Math.max(
    0,
    ...[
      ...pageViewsData,
      ...newUsersData,
      ...onlineUsersData,
      ...sessionDurationData,
    ]
  );
  const extraMargin = maxValue * 0.2;
  const yAxisMax = maxValue + extraMargin;

  // Total pages calculation
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(totalPages)
  },[])

  return (
    <div>
      <div style={{ maxWidth: "100%" }}>
        <Line
          data={{
            labels: labels,
            datasets: datasets,
          }}
          height={400}
          options={{
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: yAxisMax,
                ticks: {
                  stepSize: 1,
                  callback: (value) => (Number.isInteger(value) ? value : null),
                },
                grid: {
                  display: true,
                  color: "rgba(0, 0, 0, 0.05)",
                },
              },
              x: {
                grid: {
                  display: true,
                  color: "rgba(0, 0, 0, 0.05)",
                },
              },
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    return `${tooltipItem.raw}`;
                  },
                },
              },
              legend: {
                labels: {
                  fontSize: 15,
                },
              },
            },
          }}
        />
      </div>

      {/* Pagination Controls */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className={currentPage === 1 && " opacity-50"}
        >
          Previous
        </button>
        <span style={{ margin: "0 10px" }}>
         
        </span>
        <button
          disabled={currentPage === totalPages}
          className={currentPage === totalPages && " opacity-50"}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default DataChart;
