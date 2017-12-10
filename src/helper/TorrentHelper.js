let MongoUtil = require('../utils/MongoUtil');
let Torrent = require('../model/Torrent');
let TorrentParseUtil = require('../utils/TorrentParseUtil');
let fs = require("fs");
let logger = require('pomelo-logger').getLogger('TorrentHelper.js');

const getParentPath = () => {
    return `${__dirname}/../../torrents/`;
};

const getPath = (hash, hasSuffix) => {
    return `${getParentPath()}${hash}${hasSuffix ? '' : '.torrent'}`
};

const saveTorrent = (hash, hasSuffix) => {
    let torrent = TorrentParseUtil(getPath(hash, hasSuffix));
    torrent._id = hash;
    return MongoUtil.insertDocUnique(Torrent, torrent)
};

const scanAndSaveTorrent = (fileListPath) => {
    fs.readdir(getParentPath(), (err, files) => {
        if (err) {
            logger.error(err);
            return;
        }
        files.forEach(fileName => {
            fileName.indexOf('.torrent') > 0 && saveTorrent(fileName, true).then(result => {
                logger.info(JSON.stringify(result));
            }).catch(e => {
                logger.error(e);
            });
        })
    });
};

scanAndSaveTorrent();

module.exports = {
    saveTorrent,
    scanAndSaveTorrent
};