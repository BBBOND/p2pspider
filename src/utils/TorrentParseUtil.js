let parseTorrent = require('parse-torrent');
let fs = require('fs');

const parseTorrentFile = (fileName, filePath) => {
    return parseTorrent(fs.readFileSync((filePath || '') + fileName));
};

module.exports = parseTorrentFile;