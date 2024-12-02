const mongoose = require('mongoose');

const premiumGuildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  addedBy: { type: Object, required: true },
  expireDate: { type: Date, required: true },
  removalInfo: { type: Object },
});

const PremiumGuild = mongoose.model('PremiumGuild', premiumGuildSchema);

module.exports = PremiumGuild;
