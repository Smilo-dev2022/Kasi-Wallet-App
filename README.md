# Kasi Wallet App

This project contains a simple wallet interface with an Express backend. The server stores user accounts in MongoDB and exposes `/api/register`, `/api/login` and `/api/profile` endpoints secured with JSON Web Tokens (JWT).

The app now integrates with [PayFast](https://www.payfast.co.za/) for payments. Clicking **Send Money** or **Buy Airtime** creates a payment URL via the `/api/payfast-checkout` route.

PayFast sends Instant Payment Notifications (IPN) to `/notify`. The server verifies the signature, records a `Transaction` entry and updates the user's balance when payments are complete. You can fetch a user's recent transactions from `/api/transactions` (requires the auth token).

Internal transfers are supported via `/api/transfers`. You can also create and redeem vouchers with `/api/vouchers` and `/api/vouchers/redeem`. When creating a voucher you may supply a phone number which will trigger a mock SMS via `utils/sendSMS.js`.

Set these environment variables to link your PayFast account:

```
PAYFAST_MERCHANT_ID=yourMerchantId
PAYFAST_MERCHANT_KEY=yourMerchantKey
PAYFAST_PASSPHRASE=yourPassphrase   # optional
PAYFAST_SANDBOX=true                 # use sandbox.payfast.co.za
MONGODB_URI=mongodb://localhost/kasiwallet
JWT_SECRET=someSecretKey
# The following Twilio settings are optional and unused by the mock SMS helper
TWILIO_SID=ACxxxx
TWILIO_TOKEN=xxxx
TWILIO_PHONE=+27xxxxxxxxx
```

Copy `.env.example` to `.env` and fill in your PayFast and MongoDB details. The
server reads these variables on startup.

For convenience you can run `./setup.sh` which installs dependencies and copies
the example environment file if `.env` does not exist.

## Development

Install dependencies and start the server:

```bash
npm install
npm start
```

The app will be available on `http://localhost:3000`.

## Deployment

Run the server in production with:

```bash
npm start
```

Ensure the `.env` file contains your PayFast credentials and a MongoDB
connection string.

## Tests

Basic API tests run with Jest. Execute:

```bash
npm test
```
