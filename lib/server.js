// dependencies
const http = require('http');
const {handleReqRes} = require('../helpers/handleReqRes');
const environment = require('../helpers/environments');


// app object - module scaffolding
const server = {};

// // @TODO remove later
// sendTwilioSms('01301045952', 'Hello world', (err) => {
//     console.log(`this is the error`, err);
// });

// testing file system
// // todo pore muche dibo
// data.update('test', 'newFile', {name: 'Englad', language: 'English'}, (err) => {
//     console.log(err);
// });

// create server
server.createServer = () => {
    const createServerVariable = http.createServer(server.handleReqRes);
    createServerVariable.listen(environment.port, () => {
        console.log(`Server started on port ${environment.port}`);
    })
}


server.handleReqRes = handleReqRes;


// start the server
server.init = () => {
    server.createServer();
}

module.exports = server;