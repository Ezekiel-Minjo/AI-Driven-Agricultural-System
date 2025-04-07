import api from "./api";

export const analyzeImage = async (imageData, cropType = "maize") => {
  try {
    const response = await api.post("/diseases/analyze", {
      image_data: imageData,
      crop_type: cropType,
    });
    return response.data;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};

export const getDetectionHistory = async (farmerId = "farmer-001") => {
  try {
    const response = await api.get(`/diseases/history?farmer_id=${farmerId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching detection history:", error);
    throw error;
  }
};
