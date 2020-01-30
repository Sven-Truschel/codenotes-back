const http = require('http');
const app = require('./app');

const port = process.env.PORT || 5000;
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));
}

app.get('*', (request, response) => {
    response.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});


const server = http.createServer(app);
server.listen(port);
console.log('Server is running on ' + port);