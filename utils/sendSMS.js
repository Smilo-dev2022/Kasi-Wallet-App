exports.sendVoucherSMS = async (phone, code) => {
  console.log(`[MOCK SMS] To: ${phone} | Voucher: ${code}`);
  return { success: true };
};
