const mongoose = require('mongoose');

const suggestChannelSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  channelId: {
    type: String,
    required: true,
  },
});

const SuggestChannel = mongoose.model('SuggestChannel', suggestChannelSchema);

module.exports = SuggestChannel;
