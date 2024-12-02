const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    isBanned: { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
