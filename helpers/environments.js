const environments = {};

environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'aaabcdefghabcdefgh',
    maxChecks: 5,
    twilio: {
        fromPhone: '',
        accountSid: '',
        authToken: '',
    }

};
environments.production = {
    port: 4000,
    envName: 'production',
    secretKey: 'aaabcdefghiabcdefghi',
    maxChecks: 5,
    twilio: {
        fromPhone: '',
        accountSid: '',
        authToken: '',
    }

};

const currentEnvironment = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : 'staging';

const environmentToExport = typeof environments[currentEnvironment] === 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;