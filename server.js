const https = require('https');
const app = require('./app');
const fs = require('fs')

const port = process.env.PORT || 5000;
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));
}

var key = fs.readFileSync(__dirname + '/certs/selfsigned.key');
var cert = fs.readFileSync(__dirname + '/certs/selfsigned.crt');
var options = {
    key: key,
    cert: cert
};

app.get('*', (request, response) => {
    response.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});


const server = https.createServer(options, app);
server.listen(port);
console.log('Server is running on ' + port);