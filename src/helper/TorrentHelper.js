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
    torrent._id = torrent.infoHash;
    return MongoUtil.insertDocUnique(Torrent, torrent)
};

const saveTorrentList = (torrentList) => {
    let fileName = torrentList.pop();
    if (!!fileName) {
        fileName.indexOf('.torrent') > 0 && saveTorrent(fileName, true).then(result => {
            // logger.info(`${fileName} => ${!!result}`);
            saveTorrentList(torrentList);
        }).catch(async e => {
            logger.error(e);
            MongoUtil.connect();
            saveTorrentList(torrentList);
        });
    } else {
        MongoUtil.close();
    }
};

const scanAndSaveTorrent = (fileListPath) => {
    fs.readdir(getParentPath(), (err, files) => {
        if (err) {
            logger.error(err);
            return;
        }
        saveTorrentList(files);
    });
};

MongoUtil.connect();
scanAndSaveTorrent();

module.exports = {
    saveTorrent,
    scanAndSaveTorrent
};