import api from "./api";

export const sendEmailNotification = async (data) => {
  try {
    const response = await api.post("/notifications/email", data);
    return response.data;
  } catch (error) {
    console.error("Error sending email notification:", error);
    throw error;
  }
};

export const sendSMSNotification = async (data) => {
  try {
    const response = await api.post("/notifications/sms", data);
    return response.data;
  } catch (error) {
    console.error("Error sending SMS notification:", error);
    throw error;
  }
};

export const getNotificationHistory = async (limit = 20) => {
  try {
    const response = await api.get(`/notifications/history?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching notification history:", error);
    throw error;
  }
};
