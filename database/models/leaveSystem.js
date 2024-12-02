const { Schema, model } = require('mongoose');

const leaveSchema = new Schema({
    guildID: { type: String, required: true },
    channelID: { type: String, required: true },
    Msg: { type: String, required: true }
}, { timestamps: true });

module.exports = model('LeaveSystem', leaveSchema);
