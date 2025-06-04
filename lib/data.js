// for read and write data from file system
// dependencies

const fs = require('fs');
const path = require('path');

const lib = {};

//base directory to file
lib.basedir = path.join(__dirname, '/../.data/');

//write data for file
lib.create = function (dir, file, data, callback) {
    fs.open(lib.basedir + dir + '/' + file + '.json', 'wx', function (err, fileDescriptor) {

        //console.log('Creating ' + lib.basedir);
        //console.log('Error: ', err)
        if (!err && fileDescriptor) {
            // convert data to string
            const stringData = JSON.stringify(data);

            //write data to file and then close it
            fs.writeFile(fileDescriptor, stringData, function (err) {
                if (!err) {
                    fs.close(fileDescriptor, function (err) {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error writting to new file!');
                        }
                    })
                } else {
                    callback('Error writing to new file!');
                }
            })
        } else {
            callback(err);
        }
    })
};

lib.read = function (dir, file, callback) {
    //console.log('Creating ' + lib.basedir);
    fs.readFile(lib.basedir + dir + '/' + file + '.json', 'utf8', function (err, data) {

        //console.log('Error: ', err)
        callback(err, data);
    })
};

lib.update = function (dir, file, data, callback) {
    fs.open(lib.basedir + dir + '/' + file + '.json', 'r+', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
            const stringData = JSON.stringify(data);

            fs.ftruncate(fileDescriptor, function (err) {
                if (!err) {
                    // write file and close it
                    fs.writeFile(fileDescriptor, stringData, function (err) {
                        if (!err) {
                            // chose the file
                            fs.close(fileDescriptor, function (err) {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error closing file!');
                                }
                            })
                        } else {
                            callback('Error writing to file!');
                        }
                    })
                } else {
                    callback('Error writing to truncating file !');
                }
            })
        } else {
            console.log('Error update, file may not exist!');
        }
    });
};


module.exports = lib;