const mongoose = require('mongoose');

const modlogChannelSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  channelId: {
    type: String,
    required: true,
  },
});

const LogsChannel = mongoose.model('ModLogModel', modlogChannelSchema);

module.exports = LogsChannel;
