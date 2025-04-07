import api from "./api";

export const getCurrentWeather = async (location = null) => {
  try {
    let url = "/weather/current";

    if (location) {
      url += `?lat=${location.latitude}&lon=${location.longitude}`;
      if (location.elevation) {
        url += `&elevation=${location.elevation}`;
      }
    }

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching current weather:", error);
    throw error;
  }
};

export const getWeatherForecast = async (days = 5) => {
  try {
    const response = await api.get(`/weather/forecast?days=${days}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    throw error;
  }
};

export const getExternalWeather = async (lat, lon) => {
  try {
    const response = await api.get(`/weather/external?lat=${lat}&lon=${lon}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching external weather data:", error);
    throw error;
  }
};
