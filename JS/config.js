// API Configuration
// For production: Change this to your deployed backend URL
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://backend.orchidbeautyparlour.com.np'; // Azure backend with custom domain

export default API_URL;
