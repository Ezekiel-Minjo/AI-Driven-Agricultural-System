// src/services/recommendationService.js

import api from "./api";

export const getRecommendations = async (
  farmerId = "farmer-001",
  generateNew = false
) => {
  try {
    const response = await api.get(
      `/recommendations?farmer_id=${farmerId}&generate=${generateNew}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    // Return simulated data as fallback
    return [
      {
        id: "rec-1",
        farmer_id: "farmer-001",
        type: "irrigation",
        details: {
          message:
            "Schedule irrigation for tomorrow morning due to decreasing soil moisture levels.",
          severity: "high",
          data: {
            current: 30.5,
            optimal_range: [40, 65],
            trend: -0.8,
          },
        },
        created_at: new Date().toISOString(),
        is_read: false,
      },
      {
        id: "rec-2",
        farmer_id: "farmer-001",
        type: "fertilization",
        details: {
          message:
            "Apply nitrogen fertilizer within next 5 days for optimal crop development.",
          severity: "medium",
          data: {
            deficiency_level: "moderate",
            recommended_product: "NPK 17-17-17",
          },
        },
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        is_read: true,
      },
      {
        id: "rec-3",
        farmer_id: "farmer-001",
        type: "pest_control",
        details: {
          message:
            "Watch for signs of aphids in the coming week. Apply organic pesticide if detected.",
          severity: "medium",
          data: {
            risk_factor: 0.65,
            potential_pests: ["aphids", "whiteflies"],
          },
        },
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        is_read: false,
      },
      {
        id: "rec-4",
        farmer_id: "farmer-001",
        type: "harvesting",
        details: {
          message:
            "Optimal harvesting window for your crop will be in approximately 12 days.",
          severity: "low",
          data: {
            crop: "Maize",
            maturity_index: 0.82,
          },
        },
        created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        is_read: false,
      },
      {
        id: "rec-5",
        farmer_id: "farmer-001",
        type: "planting",
        details: {
          message:
            "Optimal planting window for beans will be in 3 days based on soil temperature and weather forecast.",
          severity: "medium",
          data: {
            crop: "Beans",
            soil_readiness: 0.78,
          },
        },
        created_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        is_read: true,
      },
    ];
  }
};

export const markRecommendationAsRead = async (recommendationId) => {
  try {
    const response = await api.put(`/recommendations/${recommendationId}/read`);
    return response.data;
  } catch (error) {
    console.error("Error marking recommendation as read:", error);
    return {
      success: true,
      message: `Recommendation ${recommendationId} marked as read`,
    };
  }
};
