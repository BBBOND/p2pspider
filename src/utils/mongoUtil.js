let f = require('util').format;
let {mongoConfig} = require('../../config');
let logger = require('pomelo-logger').getLogger('mongoUtil');
let mongoose = require('mongoose');

let url = f('mongodb://%s:%s@%s:27017/torrents?authMechanism=%s',
    mongoConfig.user, mongoConfig.password, mongoConfig.url, mongoConfig.authMechanism);
let options = {promiseLibrary: require('bluebird')};

process.env.LOGGER_LINE = true;

let documentsSchema = new mongoose.Schema({
    a: String,
    b: String
});


class mongoUtil {
    constructor() {
        mongoose.model('documents', documentsSchema);
        this.conn = mongoose.createConnection(url, options);
        this.conn.on('error', (error) => {
            console.log(error);
        });
    }

    getAllDoc(table_name) {
        return new Promise((resolve, reject) => {
            let blog = this.conn.model(table_name);
            let query = blog.find();
            query.then((doc) => {
                resolve(doc);
            }).catch((e) => {
                reject(e);
            });
            query.exec();
        });
    }

    close() {
        this.conn.close();
    }
}

let mu = new mongoUtil();

mu.getAllDoc('documents').then((result) => {
    result.map((item, index) => {
        logger.info(item, index);
    });
    mu.close();
});


// module.exports = new mongoUtil();