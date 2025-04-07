// src/services/irrigationService.js
import api from "./api";

export const getIrrigationSchedule = async (params = {}) => {
  try {
    const defaultParams = {
      crop_type: "maize",
      farmer_id: "farmer-001",
      area: 10000, // default area in square meters
    };

    const queryParams = { ...defaultParams, ...params };
    const queryString = new URLSearchParams(queryParams).toString();

    const response = await api.get(`/irrigation/schedule?${queryString}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching irrigation schedule:", error);
    throw error;
  }
};
