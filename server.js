try {
  require('dotenv').config();
} catch {
  console.warn('dotenv not installed');
}
const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Voucher = require('./models/Voucher');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/kasiwallet')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const JWT_SECRET = process.env.JWT_SECRET || 'kasiwalletsecret';

function auth(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

// Create a payment URL for PayFast
app.post('/api/payfast-checkout', auth, (req, res) => {
  const { amount, item_name = 'Kasi Wallet Payment' } = req.body;

  if (!amount) {
    return res.status(400).json({ error: 'Amount required' });
  }

  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const passphrase = process.env.PAYFAST_PASSPHRASE || '';

  if (!merchantId || !merchantKey) {
    return res.status(500).json({ error: 'PayFast not configured' });
  }

  const data = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: `${req.protocol}://${req.get('host')}/success.html`,
    cancel_url: `${req.protocol}://${req.get('host')}/cancel.html`,
    notify_url: `${req.protocol}://${req.get('host')}/notify`,
    amount: Number(amount).toFixed(2),
    item_name,
    custom_str1: req.userId
  };

  let query = Object.keys(data)
    .sort()
    .map((k) => `${k}=${encodeURIComponent(data[k])}`)
    .join('&');

  if (passphrase) {
    query += `&passphrase=${encodeURIComponent(passphrase)}`;
  }

  const signature = crypto.createHash('md5').update(query).digest('hex');
  query += `&signature=${signature}`;

  const baseUrl = process.env.PAYFAST_SANDBOX === 'true'
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process';

  res.json({ checkoutUrl: `${baseUrl}?${query}` });
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/notify', async (req, res) => {
  const data = { ...req.body };
  const signature = data.signature;
  delete data.signature;

  let query = Object.keys(data)
    .sort()
    .map((k) => `${k}=${encodeURIComponent(data[k])}`)
    .join('&');

  const passphrase = process.env.PAYFAST_PASSPHRASE || '';
  if (passphrase) query += `&passphrase=${encodeURIComponent(passphrase)}`;
  const verify = crypto.createHash('md5').update(query).digest('hex');

  if (verify !== signature) {
    console.warn('Invalid PayFast signature');
    return res.status(400).send('Invalid');
  }

  try {
    if (data.payment_status === 'COMPLETE') {
      const userId = data.custom_str1;
      const amount = parseFloat(data.amount_gross || data.amount || 0);
      const user = await User.findById(userId);
      if (user) {
        user.balance += amount;
        await user.save();
        await Transaction.create({ user: user._id, type: 'deposit', amount });
      }
    }
    res.send('OK');
  } catch (err) {
    console.error('Notify error', err);
    res.status(500).send('Error');
  }
});

app.get('/api/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/transactions', auth, async (req, res) => {
  try {
    const tx = await Transaction.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(tx);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/transfers', auth, async (req, res) => {
  const { to, amount } = req.body;
  if (!to || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid transfer' });
  }
  try {
    const sender = await User.findById(req.userId);
    const receiver = await User.findOne({ email: to });
    if (!receiver) return res.status(404).json({ message: 'Recipient not found' });
    if (sender.balance < amount) return res.status(400).json({ message: 'Insufficient funds' });
    sender.balance -= amount;
    receiver.balance += amount;
    await sender.save();
    await receiver.save();
    await Transaction.create({ user: sender._id, type: 'transfer', amount: -amount });
    await Transaction.create({ user: receiver._id, type: 'transfer', amount });
    res.json({ message: 'Transfer complete' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

const { sendVoucherSMS } = require('./utils/sendSMS');

app.post('/api/vouchers', auth, async (req, res) => {
  const { amount, phone } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }
  try {
    const user = await User.findById(req.userId);
    if (user.balance < amount) return res.status(400).json({ message: 'Insufficient funds' });
    user.balance -= amount;
    const code = 'KV' + crypto.randomBytes(4).toString('hex').toUpperCase();
    await Voucher.create({ code, amount, createdBy: user._id });
    await user.save();
    await Transaction.create({ user: user._id, type: 'withdraw', amount: -amount });
    if (phone) {
      try {
        await sendVoucherSMS(phone, code);
      } catch (smsErr) {
        console.error('SMS error', smsErr);
      }
    }
    res.json({ code });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/vouchers/redeem', auth, async (req, res) => {
  const { code } = req.body;
  try {
    const voucher = await Voucher.findOne({ code });
    if (!voucher || voucher.redeemed) {
      return res.status(400).json({ message: 'Invalid voucher' });
    }
    const user = await User.findById(req.userId);
    voucher.redeemed = true;
    voucher.redeemedBy = user._id;
    voucher.redeemedAt = new Date();
    await voucher.save();
    user.balance += voucher.amount;
    await user.save();
    await Transaction.create({ user: user._id, type: 'deposit', amount: voucher.amount });
    res.json({ message: 'Voucher redeemed', amount: voucher.amount });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
