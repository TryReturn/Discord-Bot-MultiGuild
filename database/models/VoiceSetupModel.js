const mongoose = require('mongoose');

const voiceSetupSchema = new mongoose.Schema({
  serverId: {
    type: String,
    required: true,
    unique: true,
  },
  voiceChannelId: {
    type: String,
    required: true,
  },
  categoryId: {
    type: String,
    required: false,
  },
  setupDate: {
    type: Date,
    default: Date.now,
  },
});

const VoiceSetupModel = mongoose.model('VoiceSetup', voiceSetupSchema);

module.exports = VoiceSetupModel;
