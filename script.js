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

  // Load profile info
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
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
