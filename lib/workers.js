// dependencies
const url = require('url');
const http = require('http');
const https = require('https');
const data = require('./data')
const {parseJSON} = require('../helpers/utilities');
const {sendTwilioSms} = require('../helpers/notification');

// app object - module scaffolding
const workers = {};

// lookup all the checks from database
workers.gatherAllChecks = () => {
    // get all the checks
    data.list('checks', (err, check) => {
        if (!err && check && check.length > 0) {
            check.forEach(item => {
                // read the checkData
                data.read('checks', item, (err, checkData) => {
                    if (!err && checkData) {
                        // pass the data to the check validator
                        workers.validateCheckData(parseJSON(checkData));
                    } else {
                        console.log('Error one of the reading checks data');
                    }
                })
            })
        } else {
            console.log('Could not find any checks to process')
        }
    })
};

// validate individual check data
workers.validateCheckData = (checkData) => {
    if (checkData && checkData.id) {
        checkData.state = typeof (checkData.state) === 'string' && ['up', 'down'].indexOf(checkData.state) > -1 ? checkData.state : 'down';

        checkData.lastChecked = typeof (checkData.lastChecked) === 'number' && checkData.lastChecked > 0 ? checkData.lastChecked : false;

        // pass to the next process
        workers.performCheck(checkData);

    } else {
        console.log('Check Data is invalid or not formatted');
    }
};


// perform checker
workers.performCheck = (checkData) => {

    // prepare the initial check outcome
    let checkOutCome = {
        'error': false,
        'responseCode': false,
    };

    // mark the outcome has not been yet sent
    let outcomeSent = false;

    // parse the hostname & full url from the data
    const parsedUrl = url.parse(`${checkData.protocol}://${checkData.url}`, true);
    const hostName = parsedUrl.hostname;
    const {path} = parsedUrl;

    // construct the request object
    const requestDetails = {
        protocol: `${checkData.protocol}:`,
        hostname: hostName,
        method: checkData.method.toUpperCase(),
        path,
        timeout: checkData.timeoutSeconds * 1000,
    };

    const protocolToUse = checkData.protocol === 'http' ? http : https;

    let req = protocolToUse.request(requestDetails, (res) => {
        const status = res.statusCode;

        console.log(status);

        // update the check outcome and pass to the next process
        checkOutCome.responseCode = status;
        if (!outcomeSent) {
            workers.processCheckOutcome(checkData, checkOutCome);
            outcomeSent = true;
        }
    })


    req.on('error', (err) => {
        checkOutCome = {
            error: true,
            value: err,
        };

        if (!outcomeSent) {
            workers.processCheckOutcome(checkData, checkOutCome);
            outcomeSent = true;
        }
    })

    req.on('timeout', (err) => {
        checkOutCome = {
            error: true,
            value: 'timeout',
        };

        if (!outcomeSent) {
            workers.processCheckOutcome(checkData, checkOutCome);
            outcomeSent = true;
        }
    })

    // request send
    req.end();
}

// save CheckOutcome to the database and sent to the next process
workers.processCheckOutcome = (checkData, checkOutCome) => {
    let state = !checkOutCome.error && checkOutCome.responseCode && checkData.successCodes.indexOf(checkOutCome.responseCode) > -1 ? 'up' : 'down';

    // decide weather we should alert the user or not
    let alertWanted = checkData.lastChecked && checkData.state !== state ? true : false;

    // update the check data
    let newCheckData = checkData;
    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    // update the check to the disk
    data.update('checks', newCheckData.id, newCheckData, (err) => {
        if (!err) {
            if (alertWanted) {
                // send the newcheck data to the next process
                workers.alertUserToStatusChange(newCheckData);
            } else {
                console.log('Alert is not needed as there is no state change!');
            }

        } else {
            console.log('Error: Trying to save check data of one of the checks');
        }
    })
}

//send notification sms to the user if state changes
workers.alertUserToStatusChange = (newCheckData) => {

    const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()}${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;

    sendTwilioSms(newCheckData.userPhone, msg, (err) => {
        if (!err) {
            console.log(`User was alerted to a status change via SMS: ${msg}`);
        } else {
            console.log('There was a problem to sending sms to one of the user');
        }
    })
}

//setinterval func
workers.loop = () => {
    setInterval(() => {
        workers.gatherAllChecks();
    }, 8000);
};

// start the server
workers.init = () => {
    workers.gatherAllChecks();
    workers.loop();
}

module.exports = workers;