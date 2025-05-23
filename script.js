document.addEventListener("DOMContentLoaded", () => {
  // Simple login simulation
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      localStorage.setItem("user", JSON.stringify({
        name: "Thabo M.",
        email: "thabo@example.com",
        phone: "072-123-4567",
        balance: "459.00"
      }));
      window.location.href = "index.html"; // Go to dashboard
    });
  }
document.getElementById("sendBtn").onclick = () => {
  const to = prompt("Send to (Phone Number)?");
  const amount = prompt("Amount to send?");
  if (to && amount && !isNaN(amount)) {
    if (user.balance >= amount) {
      user.balance = (user.balance - amount).toFixed(2);
      localStorage.setItem("user", JSON.stringify(user));
      alert(`Sent R${amount} to ${to}`);
      location.reload();
    } else {
      alert("Insufficient funds.");
    }
  }document.getElementById("topupBtn").onclick = () => {
  const amount = prompt("Enter amount to top up:");
  if (amount && !isNaN(amount)) {
    user.balance = (parseFloat(user.balance) + parseFloat(amount)).toFixed(2);
    localStorage.setItem("user", JSON.stringify(user));
    location.reload();
};

  // Load profile info
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {if (!localStorage.getItem("user")) {
  window.location.href = "login.html";
}

    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    set("userName", user.name);
    set("userEmail", user.email);
    set("userPhone", user.phone);
    set("userBalance", user.balance);
  }const greetName = document.getElementById("greetName");
if (greetName) {
  greetName.textContent = user.name;
}

});
// Redirect to login if user not logged in
const protectedPages = ["index.html", "profile.html"];
if (protectedPages.includes(window.location.pathname.split("/").pop()) && !localStorage.getItem("user")) {
  window.location.href = "login.html";
}
function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

  }
};
