// src/services/exportService.js
import api from "./api";
import { getSensorData } from "./sensorService";
import { getAlerts } from "./alertService";
import { getRecommendations } from "./recommendationService";
import { getIrrigationSchedule } from "./irrigationService";
import { getYieldHistory } from "./yieldService";

// Helper function to convert JSON to CSV
const convertToCSV = (arr) => {
  if (arr.length === 0) return "";

  const headers = Object.keys(arr[0]);
  const headerRow = headers.join(",");

  const rows = arr.map((obj) => {
    return headers
      .map((header) => {
        let value = obj[header];

        // Handle nested objects
        if (typeof value === "object" && value !== null) {
          value = JSON.stringify(value);
        }

        // Escape quotes and wrap in quotes if contains comma or newline
        if (typeof value === "string") {
          value = value.replace(/"/g, '""');
          if (
            value.includes(",") ||
            value.includes("\n") ||
            value.includes('"')
          ) {
            value = `"${value}"`;
          }
        }

        return value;
      })
      .join(",");
  });

  return [headerRow, ...rows].join("\n");
};

// Helper function to create and download a CSV file
const downloadCSV = (csvString, filename) => {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  // Create a URL for the blob
  const url = URL.createObjectURL(blob);

  // Set link properties
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  // Add link to document, click it, then remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Format sensor data for export
const formatSensorData = (data, sensorType) => {
  return data.map((reading) => {
    const formattedData = {
      timestamp: reading.timestamp,
      sensor_id: reading.sensor_id,
    };

    // Add data fields
    if (reading.data) {
      if (sensorType === "soil_moisture") {
        formattedData.soil_moisture = reading.data.soil_moisture;
      } else if (sensorType === "temperature") {
        formattedData.temperature = reading.data.temperature;
      } else if (sensorType === "humidity") {
        formattedData.humidity = reading.data.humidity;
      }

      formattedData.unit = reading.data.unit;
    }

    return formattedData;
  });
};

// Export sensor data to CSV
export const exportSensorData = async (sensorId, sensorType, hours = 24) => {
  try {
    const data = await getSensorData(sensorId, hours);
    const formattedData = formatSensorData(data, sensorType);
    const csv = convertToCSV(formattedData);

    const date = new Date().toISOString().split("T")[0];
    downloadCSV(csv, `sensor_data_${sensorType}_${date}.csv`);

    return { success: true, message: "Sensor data exported successfully" };
  } catch (error) {
    console.error("Error exporting sensor data:", error);
    throw error;
  }
};

// Export alerts to CSV
export const exportAlerts = async () => {
  try {
    const data = await getAlerts();
    const csv = convertToCSV(data);

    const date = new Date().toISOString().split("T")[0];
    downloadCSV(csv, `alerts_${date}.csv`);

    return { success: true, message: "Alerts exported successfully" };
  } catch (error) {
    console.error("Error exporting alerts:", error);
    throw error;
  }
};

// Export recommendations to CSV
export const exportRecommendations = async () => {
  try {
    const data = await getRecommendations();
    const csv = convertToCSV(data);

    const date = new Date().toISOString().split("T")[0];
    downloadCSV(csv, `recommendations_${date}.csv`);

    return { success: true, message: "Recommendations exported successfully" };
  } catch (error) {
    console.error("Error exporting recommendations:", error);
    throw error;
  }
};

// Export irrigation schedule to CSV
export const exportIrrigationSchedule = async (params = {}) => {
  try {
    const data = await getIrrigationSchedule(params);

    // Extract and format the schedule
    const formattedData = data.schedule.map((day) => ({
      date: day.date,
      day_of_week: day.day_of_week,
      is_irrigation_day: day.is_irrigation_day ? "Yes" : "No",
      is_rain_day: day.is_rain_day ? "Yes" : "No",
      recommendation: day.recommendation,
    }));

    const csv = convertToCSV(formattedData);

    const date = new Date().toISOString().split("T")[0];
    downloadCSV(csv, `irrigation_schedule_${date}.csv`);

    return {
      success: true,
      message: "Irrigation schedule exported successfully",
    };
  } catch (error) {
    console.error("Error exporting irrigation schedule:", error);
    throw error;
  }
};

// Export yield history to CSV
export const exportYieldHistory = async (cropType = "maize") => {
  try {
    const data = await getYieldHistory(cropType);
    const csv = convertToCSV(data);

    const date = new Date().toISOString().split("T")[0];
    downloadCSV(csv, `yield_history_${cropType}_${date}.csv`);

    return { success: true, message: "Yield history exported successfully" };
  } catch (error) {
    console.error("Error exporting yield history:", error);
    throw error;
  }
};
