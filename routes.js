// dependencies
const {sampleHandler} = require('./handlers/routeHandlers/samplehandlers')
const {userHandler} = require('./handlers/routeHandlers/userhandler')
const {tokenHandler} = require('./handlers/routeHandlers/tokenHandler')

const routes = {
    'sample': sampleHandler,
    'user': userHandler,
    'token': tokenHandler,
}

module.exports = routes;