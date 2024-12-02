const mongoose = require('mongoose');

const serverChannelSchema = new mongoose.Schema({
  serverId: {
    type: String,
    required: true,
    unique: true,
  },
  allowedChannelId: {
    type: String,
    required: true,
  },
});

const AllowChannelModel = mongoose.model('AllowChannelModel', serverChannelSchema);

module.exports = AllowChannelModel;
