export function generateVoucher(senderId, amount) {
  const code = "KV" + Math.random().toString(36).substr(2, 8).toUpperCase();

  db.vouchers.insert({
    code,
    amount,
    createdBy: senderId,
    redeemed: false,
    timestamp: Date.now()
  });

  return { voucherCode: code, amount };
}

export function redeemVoucher(code, receiverId) {
  const voucher = db.vouchers.find(code);

  if (!voucher || voucher.redeemed) throw new Error("Invalid or already used");

  db.users.find(receiverId).balance += voucher.amount;
  voucher.redeemed = true;
  voucher.redeemedBy = receiverId;
  voucher.redeemedAt = Date.now();

  return { success: true, message: "Voucher redeemed", credited: voucher.amount };
}
