const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    isBanned: { type: Boolean, default: false },
    reason: { type: String, default: 'No especificada' },
});

const BlacklistModel = mongoose.model('BlacklistModel', blacklistSchema);

module.exports = BlacklistModel;
