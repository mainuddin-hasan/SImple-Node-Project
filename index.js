// dependencies
const http = require('http');
const {handleReqRes} = require('./helpers/handleReqRes');
const environment = require('./helpers/environments');
const data = require('./lib/data')

// app object - module scaffolding
const app = {};

// testing file system
// todo pore muche dibo
data.update('test', 'newFile', {name:'Englad', language:'English'}, (err) =>{
    console.log(err);
});

// create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(environment.port, () => {
        console.log(`Server started on port ${environment.port}`);
    })
}


app.handleReqRes = handleReqRes;


// start the server

app.createServer();