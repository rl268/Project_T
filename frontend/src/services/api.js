import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const searchFood = async (query) => {
  const response = await axios.get(`${API_URL}/api/food/search?query=${query}`);
  return response.data.results;
};

export const saveProfile = async (profile) => {
  const response = await axios.post(`${API_URL}/profile`, profile);
  return response.data;
};

export const getProfile = async () => {
  const response = await axios.get(`${API_URL}/profile`);
  return Object.keys(response.data).length === 0 ? null : response.data;
};

export const saveMeal = async (foodItem) => {
  const response = await axios.post(`${API_URL}/log-meal`, foodItem);
  return response.data;
};

export const getDailyLog = async (date) => {
  const response = await axios.get(`${API_URL}/daily-log?target_date=${date}`);
  return response.data; 
};

export const getSmartSuggestions = async (date) => {
  const response = await axios.get(`${API_URL}/suggestions?target_date=${date}`);
  return response.data.suggestions;
};

export const getWeeklySummary = async (today) => {
  const response = await axios.get(`${API_URL}/weekly-summary?today=${today}`);
  return response.data.summary;
};
