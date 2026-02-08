const http = require('http');
const app = require('./app');

const PORT = 8012;
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
