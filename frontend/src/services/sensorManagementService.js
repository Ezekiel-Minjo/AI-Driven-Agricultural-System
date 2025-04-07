import api from "./api";

export const getSensors = async (farmerId = "farmer-001", fieldId = null) => {
  try {
    let url = `/sensors?farmer_id=${farmerId}`;
    if (fieldId) {
      url += `&field_id=${fieldId}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching sensors:", error);
    throw error;
  }
};

export const getSensor = async (sensorId) => {
  try {
    const response = await api.get(`/sensors/${sensorId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sensor:", error);
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

export const updateSensorStatus = async (sensorId, status) => {
  try {
    const response = await api.put(`/sensors/${sensorId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating sensor status:", error);
    throw error;
  }
};

export const getSensorTypes = async () => {
  try {
    const response = await api.get("/sensors/types");
    return response.data;
  } catch (error) {
    console.error("Error fetching sensor types:", error);
    throw error;
  }
};
