import axios from 'axios';

const API_URL = 'http://localhost:5000/api/movies';

export const getMovies = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getMovieById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};
