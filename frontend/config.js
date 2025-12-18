const config = {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000'
};

console.log('ENV VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('Config apiUrl:', config.apiUrl);

export default config;