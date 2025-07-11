// Title : Token handlers

// dependencies
const data = require('../../lib/data');
const {hash} = require('../../helpers/utilities')
const {parseJSON} = require('../../helpers/utilities')
const {createRandomString} = require('../../helpers/utilities')

const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
}

handler._token = {};

handler._token.get = (requestProperties, callback) => {
    // check the token id is valid
    const id = typeof (requestProperties.queryStringObject.id) === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false;

    if (id) {
        // find the data
        data.read('tokens', id, (err, tokenData) => {
            const token = {...parseJSON(tokenData)};
            if (!err && token) {
                callback(200, token);
            } else {
                callback(404, {
                    error: 'request token not found',
                })
            }
        })
    } else {
        callback(404, {
            error: 'Request token id not found',
        })
    }
};

handler._token.post = (requestProperties, callback) => {
    const phone = typeof (requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const password = typeof (requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    if (phone && password) {
        data.read('users', phone, (err, userData) => {
            let hashedPassword = hash(password);
            if (hashedPassword === parseJSON(userData).password) {
                const tokenId = createRandomString(20);
                const expires = Date.now() + 60 * 60 * 1000;
                const tokenObject = {
                    phone,
                    'id': tokenId,
                    expires
                };

                // store the token in db
                data.create('tokens', tokenId, tokenObject, (err) => {
                    if (!err) {
                        callback(200, tokenObject);
                    } else {
                        callback(500, {
                            error: err,
                        })
                    }
                });
            } else {
                callback(400, {
                    error: 'Passwords is not valid!',
                })
            }
        })
    } else {
        callback(400, {
            error: 'You have a problem in request!',
        })
    }

};

handler._token.put = (requestProperties, callback) => {
    // check the token id is valid
    const id = typeof (requestProperties.body.id) === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id.trim() : false;

    const extend = typeof (requestProperties.body.extend) === 'boolean' && requestProperties.body.extend === true ? true : false;

    if (id && extend) {
        //console.log('PUT request body:', requestProperties.body);
        console.log('Parsed ID:', id);
        console.log('Parsed Extend:', extend);
        data.read('tokens', id, (err, tokenData) => {
            const tokenObject = parseJSON(tokenData);
            if (!err && tokenObject.expires > Date.now()) {
                tokenObject.expires = Date.now() + 60 * 60 * 1000;

                // store the updated token
                data.update('tokens', id, tokenObject, (err) => {
                    if (!err) {
                        callback(200, {
                            message: 'Token updated successfully.',
                        })
                    } else {
                        callback(500, {
                            error: 'There was server side error!',
                        })
                    }
                })
            } else {
                callback(400, {
                    error: 'Token already expired!',
                })
            }
        })
    } else {
        callback(400, {
            error: 'You have a problem in request!',
        })
    }

};

handler._token.delete = (requestProperties, callback) => {
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

handler._token.verify = (id, phone, callback) => {
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