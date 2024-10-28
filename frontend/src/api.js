import axios from 'axios';

// Create an axios instance with a base URL and default headers
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Base URL for the API
  headers: {
    'Content-Type': 'application/json', // Default content type for requests
  },
});

// Wrapper function for GET requests
export const get = (url, config = {}) => {
  return api.get(url, config);
};

// Wrapper function for POST requests
export const post = (url, data, config = {}) => {
  return api.post(url, data, config);
};

// Wrapper function for PUT requests
export const put = (url, data, config = {}) => {
  return api.put(url, data, config);
};

// Wrapper function for DELETE requests
export const del = (url, config = {}) => {
  return api.delete(url, config);
};
