// src/services/farmService.js

import api from "./api";

export const getFarms = async (farmerId = "farmer-001") => {
  try {
    const response = await api.get(`/farms?farmer_id=${farmerId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching farms:", error);
    // Return simulated data as fallback
    return [
      {
        _id: "1",
        farmer_id: "farmer-001",
        name: "Main Farm",
        location: "Nairobi East",
        area_hectares: 5.2,
        crops: [
          {
            name: "Maize",
            area_hectares: 3.0,
            planting_date: "2023-03-15",
            expected_harvest_date: "2023-07-25",
          },
          {
            name: "Beans",
            area_hectares: 2.2,
            planting_date: "2023-04-05",
            expected_harvest_date: "2023-06-30",
          },
        ],
        created_at: "2023-01-10T08:30:00.000Z",
        updated_at: "2023-05-20T14:15:00.000Z",
      },
      {
        _id: "2",
        farmer_id: "farmer-001",
        name: "River Plot",
        location: "Nairobi West",
        area_hectares: 1.8,
        crops: [
          {
            name: "Tomatoes",
            area_hectares: 1.0,
            planting_date: "2023-02-20",
            expected_harvest_date: "2023-05-15",
          },
          {
            name: "Kale",
            area_hectares: 0.8,
            planting_date: "2023-03-10",
            expected_harvest_date: "2023-05-01",
          },
        ],
        created_at: "2023-01-15T10:45:00.000Z",
        updated_at: "2023-03-22T09:30:00.000Z",
      },
    ];
  }
};

export const getFarm = async (farmId) => {
  try {
    const response = await api.get(`/farms/${farmId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching farm:", error);
    // Return simulated data as fallback
    const farms = await getFarms();
    return farms.find((farm) => farm._id === farmId) || null;
  }
};

export const createFarm = async (farmData) => {
  try {
    const response = await api.post("/farms", farmData);
    return response.data;
  } catch (error) {
    console.error("Error creating farm:", error);
    throw error;
  }
};

export const updateFarm = async (farmId, farmData) => {
  try {
    const response = await api.put(`/farms/${farmId}`, farmData);
    return response.data;
  } catch (error) {
    console.error("Error updating farm:", error);
    throw error;
  }
};

export const deleteFarm = async (farmId) => {
  try {
    const response = await api.delete(`/farms/${farmId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting farm:", error);
    throw error;
  }
};
