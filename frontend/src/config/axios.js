import axios from 'axios';

const backend = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 10000,
    withCredentials: true
});

export default backend;