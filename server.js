const http = require('http');
const app = require('./app');

const PORT = 8012;
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});



// const http = require('http');
// const express = require('express'); // Required to create a route for IP check
// const axios = require('axios');
// const app = require('./app');

// // ✅ Add debug route to check Railway public IP
// app.get('/my-ip', async (req, res) => {
//     try {
//         const response = await axios.get('https://ifconfig.me');
//         res.send(`Public IP of this Railway instance: ${response.data}`);
//     } catch (err) {
//         res.status(500).send('Error fetching IP: ' + err.message);
//     }
// });

// const PORT = 5000;
// const server = http.createServer(app);

// server.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
// });
