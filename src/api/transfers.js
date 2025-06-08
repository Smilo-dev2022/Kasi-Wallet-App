export function transferFunds(senderId, receiverId, amount) {
  if (!senderId || !receiverId || amount <= 0) throw new Error("Invalid transfer");

  const sender = db.users.find(senderId);
  const receiver = db.users.find(receiverId);

  if (sender.balance < amount) throw new Error("Insufficient funds");

  sender.balance -= amount;
  receiver.balance += amount;

  db.transactions.insert({
    type: "transfer",
    from: senderId,
    to: receiverId,
    amount,
    timestamp: Date.now()
  });

  return { success: true, message: "Transfer completed" };
}
