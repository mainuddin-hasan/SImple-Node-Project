// module scafholding
const environments = require('../helpers/environments')
const crypto = require('crypto');
const utilities = {};

// parse Json string to Object
utilities.parseJSON = (jsonString) => {
    let output;
    try {
        output = JSON.parse(jsonString);
    } catch {
        output = {};
    }
    return output;
}

utilities.hash = (str) => {
    if (typeof str === 'string' && str.length > 0) {
        const hash = crypto
            .createHmac('sha256', environments.secretKey)
            .update(str)
            .digest('hex');
        return hash;
    } else {
        return false;
    }
}

// create random string
utilities.createRandomString = (strLenth) => {
    let length = strLenth;
    length = typeof (strLenth) === 'number' && strLenth > 0 ? strLenth : false;

    if (length) {
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let output = '';
        for (let i = 1; i <= length; i++) {
            const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            output += randomCharacter;
        }
        return output;
    } else {
        return false;
    }
}

module.exports = utilities;
