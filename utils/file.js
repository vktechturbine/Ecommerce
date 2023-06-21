const fs = require('fs');

const path = require('path');

const fileDelete =  (filepah) => {
    fs.unlink(filepah,(error) => {
        if(error){
            throw error;
        }
    })
}

module.exports = fileDelete;