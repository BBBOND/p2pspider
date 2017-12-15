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

const saveTorrentList = async (torrentList) => {
    let fileName = torrentList.pop();
    if (!!fileName && fileName.indexOf('.torrent') > 0) {
        try {
            let result = await saveTorrent(fileName, true);
            if (result && result.msg) {
                logger.info(result.msg);
            } else {
                logger.info(`${fileName} => ${!!result ? '保存成功' : '保存失败'}`);
            }
            fs.unlinkSync(getParentPath() + fileName);
            await saveTorrentList(torrentList);
        } catch (e) {
            logger.error(e);
            MongoUtil.connect();
            await saveTorrentList(torrentList);
        }
    }
};

const scanAndSaveTorrent = () => {
    fs.readdir(getParentPath(), async (err, files) => {
        if (err) {
            logger.error(err);
            return;
        }
        let length = files.length;
        let page = Math.ceil(length / 500);
        for (let i = 0; i < page; i++) {
            await saveTorrentList(files.slice(i * 500, (i + 1) * 500));
            console.log(`${i / page}%`);
        }
        MongoUtil.close();
    });
};

MongoUtil.connect();
scanAndSaveTorrent();

module.exports = {
    saveTorrent,
    scanAndSaveTorrent
};