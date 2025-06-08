import React, { useState } from 'react';

export default function VoucherSender({ token }) {
  const [amount, setAmount] = useState('');
  const [voucher, setVoucher] = useState(null);

  const generateVoucher = async (e) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value) return;
    try {
      const res = await fetch('/api/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({ amount: value }),
      });
      const data = await res.json();
      if (res.ok) {
        setVoucher(data.code);
        setAmount('');
      } else {
        alert(data.message || 'Failed to generate voucher');
      }
    } catch {
      alert('Network error');
    }
  };

  return (
    <div>
      <h2>Create Voucher</h2>
      <form onSubmit={generateVoucher}>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button type="submit">Generate</button>
      </form>
      {voucher && <p>Voucher Code: {voucher}</p>}
    </div>
  );
}
