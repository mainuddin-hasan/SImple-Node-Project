// Title : User handlers

// dependencies
const data = require('../../lib/data');
const {hash} = require('../../helpers/utilities')
const {parseJSON} = require('../../helpers/utilities')
const tokenHandler = require('./tokenHandler');

const handler = {};

handler.userHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._user[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
}

handler._user = {};

handler._user.get = (requestProperties, callback) => {
    // check the phone number is valid
    const phone = typeof (requestProperties.queryStringObject.phone) === 'string' && requestProperties.queryStringObject.phone.trim().length === 11 ? requestProperties.queryStringObject.phone : false;

    if (phone) {

        const token = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            console.log('token : ' + token);
            console.log('Phone : ' + phone);
            console.log('token Id : ' + tokenId);
            if (tokenId) {
                data.read('users', phone, (err, userData) => {
                    if (!err && userData) {
                        const data = {...parseJSON(userData)};
                        delete data.password;
                        callback(200, data);
                    } else {
                        callback(404, {
                            error: 'request user not found',
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
        callback(404, {
            error: 'Request user not found',
        })
    }
};

handler._user.post = (requestProperties, callback) => {
    const firstName = typeof (requestProperties.body.firstName) === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof (requestProperties.body.lastName) === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const phone = typeof (requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const password = typeof (requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    const tosAgreement = typeof (requestProperties.body.tosAgreement) === 'boolean' && requestProperties.body.tosAgreement ? requestProperties.body.tosAgreement : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        data.read('users', phone, (err) => {
            if (err) {
                let userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };
                // store the user to db
                data.create('users', phone, userObject, (err) => {
                    if (!err) {
                        callback(200, {
                            message: 'user created successfully',
                        })
                    } else {
                        callback(500, {
                            error: 'Could not create user cause USER already exists',
                        })
                    }
                })
            } else {
                callback(405, {
                    error: 'There was a problem in server side',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in request!',
        })
    }

};

handler._user.put = (requestProperties, callback) => {

    const phone = typeof (requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const firstName = typeof (requestProperties.body.firstName) === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof (requestProperties.body.lastName) === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const password = typeof (requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    if (phone) {
        if (firstName || lastName || password) {

            const token = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;

            tokenHandler._token.verify(token, phone, (tokenId) => {
                console.log('token : ' + token);
                console.log('Phone : ' + phone);
                console.log('token Id : ' + tokenId);
                if (tokenId) {
                    // lookup the user
                    data.read('users', phone, (err, uData) => {

                        const userData = {...parseJSON(uData)};

                        if (!err && userData) {
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (password) {
                                userData.password = hash(password);
                            }

                            // store data in db
                            data.update('users', phone, userData, (err) => {
                                if (!err) {
                                    callback(200, {
                                        message: 'user updated successfully',
                                    })
                                } else {
                                    callback(500, {
                                        error: 'There was a problem in server side',
                                    })
                                }
                            })
                        } else {
                            callback(400, {
                                error: 'file not exist'
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
            callback(400, {
                error: 'Please give the update field what you want to update',
            })
        }
    } else {
        callback(400, {
            error: 'Invalid phone number',
        })
    }
};
handler._user.delete = (requestProperties, callback) => {

};

module.exports = handler;