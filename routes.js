// dependencies
const {sampleHandler} = require('./handlers/routeHandlers/samplehandlers')
const {userHandler} = require('./handlers/routeHandlers/userhandler')
const {tokenHandler} = require('./handlers/routeHandlers/tokenHandler')
const {checkHandler} = require('./handlers/routeHandlers/checkHandler')

const routes = {
    'sample': sampleHandler,
    'user': userHandler,
    'token': tokenHandler,
    'check': checkHandler,

}

module.exports = routes;