import QRCode from 'qrcode.react';

export default function QRDisplay({ merchantId, amount }) {
  const qrPayload = JSON.stringify({ merchantId, amount });

  return <QRCode value={qrPayload} size={256} level="H" />;
}
