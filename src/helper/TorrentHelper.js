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

const scanAndSaveTorrent = async (fileListPath) => {
    await fs.readdir(getParentPath(), async (err, files) => {
        if (err) {
            logger.error(err);
            return;
        }
        await files.map(async (fileName, index) => {
            fileName.indexOf('.torrent') > 0 && await saveTorrent(fileName, true).then(result => {
                logger.info(`${fileName} => ${!!result}`);
                if (index === files.length - 1) {
                    MongoUtil.close();
                }
            }).catch(async e => {
                logger.error(e);
                await scanAndSaveTorrent();
            });
        });
    });
};

MongoUtil.connect();
scanAndSaveTorrent();

module.exports = {
    saveTorrent,
    scanAndSaveTorrent
};