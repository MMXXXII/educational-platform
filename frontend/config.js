const config = {
  apiUrl: "https://educational-platform-vvs0.onrender.com", 
};

console.log('ENV VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('Config apiUrl:', config.apiUrl);

export default config;