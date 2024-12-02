const mongoose = require('mongoose');

const CustomReactionsSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  upvoteEmoji: { type: String, default: 'YOUR_ID_EMOJI' },
  downvoteEmoji: { type: String, default: 'YOUR_ID_EMOJI' },
  enabled: { type: Boolean, default: false }
});

module.exports = mongoose.model('CustomReactions', CustomReactionsSchema);