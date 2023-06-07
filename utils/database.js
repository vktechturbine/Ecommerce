/* 
const MongoClient = require('mongodb').MongoClient;

const url = "   ";

let _db;

const mongoConnect = callback => {

    MongoClient.connect(url).then((client) => {
        // console.log(client);
        _db = client.db();
        callback();
    }).catch(error => {
        console.log(error);
    });
}


const getDb = () => {
    if(_db){
        return _db;
    }
    throw new Error("Database not connected");
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;

 */