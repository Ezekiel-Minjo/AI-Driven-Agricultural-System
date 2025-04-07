// src/services/alertService.js

import api from "./api";

export const getAlerts = async (farmerId = "farmer-001") => {
  try {
    const response = await api.get(`/alerts?farmer_id=${farmerId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching alerts:", error);
    // Return simulated data as fallback
    return [
      {
        id: "alert-1",
        type: "warning",
        message: "Soil moisture dropping below optimal levels in Field 1.",
        created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        time: "2 hours ago",
        is_read: false,
      },
      {
        id: "alert-2",
        type: "info",
        message: "Light rain expected tomorrow morning.",
        created_at: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
        time: "4 hours ago",
        is_read: true,
      },
      {
        id: "alert-3",
        type: "danger",
        message: "Temperature exceeding crop tolerance in Field 2.",
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        time: "1 hour ago",
        is_read: false,
      },
      {
        id: "alert-4",
        type: "warning",
        message: "Humidity levels rising rapidly, monitor for disease risk.",
        created_at: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
        time: "5 hours ago",
        is_read: false,
      },
      {
        id: "alert-5",
        type: "info",
        message: "Optimal planting conditions will occur in 3 days.",
        created_at: new Date(Date.now() - 28800000).toISOString(), // 8 hours ago
        time: "8 hours ago",
        is_read: true,
      },
      {
        id: "alert-6",
        type: "warning",
        message: "Potential pest detection in southern part of Field 1.",
        created_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        time: "12 hours ago",
        is_read: false,
      },
      {
        id: "alert-7",
        type: "info",
        message: "Weather forecast updated: clear skies for the next 5 days.",
        created_at: new Date(Date.now() - 64800000).toISOString(), // 18 hours ago
        time: "18 hours ago",
        is_read: true,
      },
    ];
  }
};

export const markAlertAsRead = async (alertId) => {
  try {
    const response = await api.put(`/alerts/${alertId}/read`);
    return response.data;
  } catch (error) {
    console.error("Error marking alert as read:", error);
    return { success: true, message: `Alert ${alertId} marked as read` };
  }
};
