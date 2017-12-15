'use strict';

// This is an example of using p2pspider, you can change the code to make it do something else.
let fs = require('fs');
let path = require('path');
let bencode = require('bencode');
let P2PSpider = require('./lib');
let moment = require('moment');

const p2p = P2PSpider({
    nodesMaxSize: 400,
    maxConnections: 800,
    timeout: 10000
});

p2p.ignore((infohash, rinfo, callback) => {
    let torrentFilePathSaveTo = path.join(__dirname, "torrents", infohash + ".torrent");
    fs.exists(torrentFilePathSaveTo, (exists) => {
        callback(exists); //if is not exists, download the metadata.
    });
});

p2p.on('metadata', (metadata) => {
    let torrentFilePathSaveTo = path.join(__dirname, "torrents", metadata.infohash + ".torrent");
    fs.writeFile(torrentFilePathSaveTo, bencode.encode({'info': metadata.info}), (err) => {
        if (err) {
            return console.error(err);
        }
        let torrentFileListPath = path.join(__dirname, "torrentsList", moment().format('YYYY-MM-DD') + ".txt");
        fs.appendFileSync(torrentFileListPath, metadata.infohash + ".torrent");
        // console.log(metadata.infohash + ".torrent has saved.");
    });
});

p2p.listen(6881, '0.0.0.0');
