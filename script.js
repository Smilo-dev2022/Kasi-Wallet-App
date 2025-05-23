// script.js

// Attach click handlers to buttons
document.getElementById('sendBtn').addEventListener('click', sendMoney);
document.getElementById('receiveBtn').addEventListener('click', receiveMoney);
document.getElementById('airtimeBtn').addEventListener('click', buyAirtime);
document.getElementById('scanBtn').addEventListener('click', scanQRCode);

function sendMoney() {
    console.log("Send Money clicked - calling Moment PayCo API (simulated)");
    alert("Simulating Send Money via Moment PayCo API...");
    // TODO: Replace with actual API integration
}
function receiveMoney() {
    console.log("Receive Money clicked - calling Moment PayCo API (simulated)");
    alert("Simulating Receive Money via Moment PayCo API...");
    // TODO: Replace with actual API integration
}
function buyAirtime() {
    console.log("Buy Airtime clicked - calling Moment PayCo API (simulated)");
    alert("Simulating Buy Airtime via Moment PayCo API...");
    // TODO: Replace with actual API integration
}
function scanQRCode() {
    console.log("Scan QR Code clicked - calling Moment PayCo API (simulated)");
    alert("Simulating Scan QR Code via Moment PayCo API...");
    // TODO: Replace with actual API integration
}
