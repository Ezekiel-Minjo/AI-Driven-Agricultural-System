// src/services/sensorService.js
import api from "./api";

export const getSensors = async (farmerId = "farmer-001") => {
  try {
    const response = await api.get(`/sensors?farmer_id=${farmerId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sensors:", error);
    throw error;
  }
};

export const getSensorData = async (sensorId, hours = 24) => {
  try {
    const response = await api.get(
      `/readings?sensor_id=${sensorId}&hours=${hours}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    throw error;
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
