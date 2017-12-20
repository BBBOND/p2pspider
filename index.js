'use strict';
let fs = require('fs');
let path = require('path');
let bencode = require('bencode');
let P2PSpider = require('./lib');
let MongoUtil = require('./src/utils/MongoUtil');
let parseTorrentFile = require('./src/utils/TorrentParseUtil');
let Torrent = require('./src/model/Torrent');
let logger = require('pomelo-logger').getLogger('index.js');

const p2p = P2PSpider({
    nodesMaxSize: 400,
    maxConnections: 800,
    timeout: 10000
});

const getTorrent = (torrentPath) => {
    let torrent = parseTorrentFile(torrentPath);
    torrent._id = torrent.infoHash;
    return torrent;
};

p2p.ignore((infohash, rinfo, callback) => {
    let torrentFilePathSaveTo = path.join(__dirname, "torrents", infohash + ".torrent");
    fs.exists(torrentFilePathSaveTo, (exists) => {
        callback(exists); //if is not exists, download the metadata.
    });
});

p2p.on('metadata', (metadata) => {
    let torrentFilePathSaveTo = path.join(__dirname, "torrents", metadata.infohash + ".torrent");
    fs.writeFile(torrentFilePathSaveTo, bencode.encode({'info': metadata.info}), async (err) => {
        if (err) {
            return logger.error(err);
        }
        let torrent;
        try {
            torrent = getTorrent(torrentFilePathSaveTo, true);
        } catch (e) {
            fs.unlinkSync(torrentFilePathSaveTo);
            return logger.error(e);
        }
        if (!!torrent) {
            try {
                let result = await MongoUtil.insertDocUnique(Torrent, torrent);
                if (result && result.msg) {
                    logger.info(result.msg);
                } else {
                    logger.info(`${metadata.infohash} => ${!!result ? '保存成功' : '保存失败'}`);
                }
                return fs.unlinkSync(torrentFilePathSaveTo);
            } catch (e) {
                MongoUtil.connect();
                return fs.unlinkSync(torrentFilePathSaveTo);
            }
        }
        return null;
    });
});

MongoUtil.connect();
p2p.listen(6881, '0.0.0.0');
