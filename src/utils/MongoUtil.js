let f = require('util').format;
let {mongoConfig} = require('../../config');
let logger = require('pomelo-logger').getLogger('mongoUtil');
let mongoose = require('mongoose');
let URL = f(
    'mongodb://%s:%s@%s:27017/torrents?authMechanism=%s',
    mongoConfig.user,
    mongoConfig.password,
    mongoConfig.url,
    mongoConfig.authMechanism
);
let options = {
    promiseLibrary: require('bluebird'),
    useMongoClient: true,
    server: {
        auto_reconnect: true,
        poolSize: 10
    }
};
mongoose.Promise = global.Promise;

class MongoUtil {
    connect(url = URL) {
        mongoose.connect(url, options);
    }

    getAllDoc(schema) {
        return new Promise((resolve, reject) => {
            schema.find({}, (err, doc) => {
                err && reject(err);
                resolve(doc);
            });
        });
    }

    insertDoc(schema, doc) {
        return new Promise((resolve, reject) => {
            let s = new schema(doc);
            s.save((err, result) => {
                err && reject(err);
                resolve(result);
            });
        });
    }

    insertDocUnique(schema, doc, uniqueKeys) {
        return new Promise((resolve, reject) => {
            let query = {};
            uniqueKeys = uniqueKeys || ['_id'];
            uniqueKeys.map((key) => {
                query[key] = doc[key];
            });
            this.findDocsByQuery(schema, query).then(docs => {
                if (docs.length > 0) {
                    logger.info(`${doc[uniqueKeys[0]]} 已存在`);
                    resolve({msg: `${doc[uniqueKeys[0]]} 已存在`})
                } else {
                    let s = new schema(doc);
                    s.save((err, result) => {
                        err && reject(err);
                        resolve(result);
                    });
                }
            }).catch(e => {
                reject(e);
            })
        });
    }

    findDocsByQuery(schema, query) {
        return new Promise((resolve, reject) => {
            schema.find(query, (err, doc) => {
                err && reject(err);
                resolve(doc);
            });
        });
    }

    close() {
        mongoose.disconnect();
    }
}

module.exports = new MongoUtil();