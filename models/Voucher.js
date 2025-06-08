const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  amount: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  redeemedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  redeemed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  redeemedAt: Date
});

module.exports = mongoose.model('Voucher', VoucherSchema);
