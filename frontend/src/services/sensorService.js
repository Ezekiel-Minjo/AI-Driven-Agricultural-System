// src/services/sensorService.js
import api from "./api";

export const getSensors = async (farmerId = "farmer-001") => {
  try {
    const response = await api.get(`/sensors?farmer_id=${farmerId}`);

    // Handle empty response data
    if (
      !response.data ||
      (Array.isArray(response.data) && response.data.length === 0)
    ) {
      console.warn("No sensors found for this farmer");
      // Return empty array instead of throwing
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching sensors:", error);
    // Instead of re-throwing the error, return an empty array
    // This prevents the error from bubbling up and allows the app to use fallback data
    return [];
  }
};

export const getSensorData = async (sensorId, hours = 24) => {
  try {
    const response = await api.get(
      `/readings?sensor_id=${sensorId}&hours=${hours}`
    );

    // Handle empty response data
    if (!response.data) {
      console.warn(`No data found for sensor: ${sensorId}`);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    // Return empty array instead of throwing
    return [];
  }
};

export const createSensor = async (sensorData) => {
  try {
    const response = await api.post("/sensors", sensorData);
    return response.data;
  } catch (error) {
    console.error("Error creating sensor:", error);
    throw error;
  }
};

export const updateSensor = async (sensorId, sensorData) => {
  try {
    const response = await api.put(`/sensors/${sensorId}`, sensorData);
    return response.data;
  } catch (error) {
    console.error("Error updating sensor:", error);
    throw error;
  }
};

export const deleteSensor = async (sensorId) => {
  try {
    const response = await api.delete(`/sensors/${sensorId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting sensor:", error);
    throw error;
  }
};
