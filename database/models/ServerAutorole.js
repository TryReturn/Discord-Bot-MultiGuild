const mongoose = require('mongoose');

const serverAutoroleSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
    },
    roles: {
        type: [String],
        required: true,
    },
    descriptions: {
        type: [String],
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('ServerAutorole', serverAutoroleSchema);
