const { Schema, model } = require('mongoose');

const welcomeSchema = new Schema({
    guildID: { type: String, required: true },
    channelID: { type: String, required: true },
    Msg: { type: String, required: true },
    enabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = model('WelcomeSystem', welcomeSchema);
