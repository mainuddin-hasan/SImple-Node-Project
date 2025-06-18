// Title : Token handlers

// dependencies
const data = require('../../lib/data');
const {parseJSON} = require('../../helpers/utilities')
const {createRandomString} = require('../../helpers/utilities')
const tokenHandler = require("./tokenHandler");
const {maxChecks} = require("../../helpers/environments")

const handler = {};

handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
}

handler._check = {};

handler._check.get = (requestProperties, callback) => {
    // check the checks id is valid
    const id = typeof (requestProperties.queryStringObject.id) === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false;

    if (id) {
        // lookup the checks
        data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                const token = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;

                tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        callback(200, parseJSON(checkData));
                    } else {
                        callback(403, {
                            error: 'Authentication failed during token!'
                        })
                    }
                });
            } else {
                callback(500, {
                    error: 'There is a server side error!'
                })
            }
        })
    } else {
        callback(400, {
            error: 'You have a problem in your request!'
        })
    }
};

handler._check.post = (requestProperties, callback) => {
    // validate input
    let protocol = typeof (requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    let url = typeof (requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    let method = typeof (requestProperties.body.method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;

    let successCodes = typeof (requestProperties.body.successCodes) === 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false;

    let timeoutSeconds = typeof (requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds : false;

    if (protocol && url && method && successCodes && timeoutSeconds) {
        const token = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;

        // lookup the user phone by reading the token
        data.read('tokens', token, (err, tokenData) => {
            if (!err && tokenData) {
                let userPhone = parseJSON(tokenData).phone;
                // lookup the user data
                data.read('users', userPhone, (err, userData) => {
                    if (!err && userData) {
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                let userObject = parseJSON(userData);
                                let userChecks = typeof (userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];
                                if (userChecks.length < maxChecks) {
                                    let checkId = createRandomString(20);
                                    let checkObject = {
                                        'id': checkId,
                                        'userPhone': userPhone,
                                        'protocol': protocol,
                                        'url': url,
                                        'method': method,
                                        'successCodes': successCodes,
                                        'timeoutSeconds': timeoutSeconds,
                                    }
                                    //save the object
                                    data.create('checks', checkId, checkObject, (err) => {
                                        if (!err) {
                                            // add checkId to the users object
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            // save the new user data
                                            data.update('users', userPhone, userObject, (err) => {
                                                if (!err) {
                                                    callback(200, userObject);
                                                } else {
                                                    callback(500, {
                                                        error: 'There is a server side error',
                                                    })
                                                }
                                            })
                                        } else {
                                            callback(500, {
                                                error: 'There is a server side error',
                                            })
                                        }
                                    })
                                } else {
                                    callback(401, {
                                        error: 'User Has already reached max checks',
                                    })
                                }
                            } else {
                                callback(403, {
                                    error: 'Authentication failed',
                                })
                            }
                        })
                    } else {
                        callback(403, {
                            error: 'User not found',
                        })
                    }
                })
            } else {
                callback(403, {
                    error: 'Authentication error',
                })
            }
        })
    } else {
        callback(400, {
            error: 'You have a problem in your request!'
        })
    }
};

handler._check.put = (requestProperties, callback) => {
    // check the checks id is valid
    const id = typeof (requestProperties.body.id) === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;

    let protocol = typeof (requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    let url = typeof (requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    let method = typeof (requestProperties.body.method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;

    let successCodes = typeof (requestProperties.body.successCodes) === 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false;

    let timeoutSeconds = typeof (requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds : false;

    if (id) {
        if (protocol || url || method || successCodes || timeoutSeconds) {
            data.read('checks', id, (err, checkData) => {
                if (!err && checkData) {
                    const checkObject = parseJSON(checkData);
                    const token = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;

                    tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            if (protocol) {
                                checkObject.protocol = protocol;
                            }
                            if (url) {
                                checkObject.url = url;
                            }
                            if (method) {
                                checkObject.method = method;
                            }
                            if (successCodes) {
                                checkObject.successCodes = successCodes;
                            }
                            if (timeoutSeconds) {
                                checkObject.timeoutSeconds = timeoutSeconds;
                            }

                            // store the checkObject
                            data.update('checks', id, checkObject, (err) => {
                                if (!err) {
                                    callback(200, checkObject);
                                } else {
                                    callback(500, {
                                        error: 'There is a server side error',
                                    })
                                }
                            })

                        } else {
                            callback(403, {
                                error: 'Authentication failed',
                            })
                        }
                    })
                } else {
                    callback(500, {
                        error: 'There is a server side error',
                    })
                }
            })
        } else {
            callback(400, {
                error: 'You must provide at least one valid field for update'
            })
        }
    } else {
        callback(400, {
            error: 'You have a problem in your request!'
        })
    }
};

handler._check.delete = (requestProperties, callback) => {
    const id = typeof (requestProperties.queryStringObject.id) === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false;

    if (id) {
        data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                data.delete('tokens', id, (err) => {
                    if (!err) {
                        callback(200, {
                            message: 'Token deleted successfully.',
                        })
                    } else {
                        callback(500, {
                            error: 'There was server side error when deleting tokens.!',
                        })
                    }
                })
            } else {
                callback(500, {
                    error: 'There was server side error!',
                })
            }
        })

    } else {
        callback(400, {
            error: 'You have a problem in request!',
        })
    }
};

handler._check.verify = (id, phone, callback) => {
    data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            if (parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    })
}

module.exports = handler;