// dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');


// app object - module scaffolding
const app = {};

app.init = () => {
    // start the server
    server.init();

    // start the workers
    workers.init();

}
app.init();

module.exports = app;