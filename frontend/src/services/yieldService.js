import api from "./api";

export const predictYield = async (data) => {
  try {
    const response = await api.post("/yields/predict", data);
    return response.data;
  } catch (error) {
    console.error("Error predicting yield:", error);
    throw error;
  }
};

export const getYieldHistory = async (cropType = "maize", years = 5) => {
  try {
    const response = await api.get(
      `/yields/history?crop_type=${cropType}&years=${years}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching yield history:", error);
    throw error;
  }
};
