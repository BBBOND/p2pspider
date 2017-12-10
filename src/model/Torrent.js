let mongoose = require('mongoose');

let Torrent = mongoose.model('Torrent', new mongoose.Schema({
    _id: String,
    // info: {length: Number, name: Buffer, 'piece length': Number, pieces: Buffer},
    // infoBuffer: Buffer,
    infoHash: String,
    name: String,
    // private: Boolean,
    created: Date,
    // comment: String,
    // announce: [String],
    urlList: [String],
    files: [{path: String, name: String, length: Number, offset: Number}],
    length: Number,
    // pieceLength: Number,
    // lastPieceLength: Number,
    // pieces: [String]
}, {autoIndex: false}));

module.exports = Torrent;