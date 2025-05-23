// Show a message in the visible console area
function showConsoleMessage(message, color = "red") {
    const msgDiv = document.getElementById("console-message");
    if (msgDiv) {
        msgDiv.textContent = message;
        msgDiv.style.color = color;
    }
}

// Login form validation and feedback

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      const validEmail = "admin@kasiwallet.com";
      const validPassword = "admin123";

      if (!email || !password) {
        showConsoleMessage("Please enter both email and password.", "red");
        return;
      }

      if (email === validEmail && password === validPassword) {
        localStorage.setItem("user", JSON.stringify({
          name: "Thabo M.",
          email: email,
          phone: "072-123-4567",
          balance: "459.00"
        }));

        showConsoleMessage("Login successful!", "green");
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);
      } else {
        showConsoleMessage("Invalid phone/email or password.", "red");
      }
    });
  }

  // Auto-fill user data and redirect if not logged in
  const user = JSON.parse(localStorage.getItem("user"));

  if (["index.html", "profile.html"].includes(window.location.pathname.split("/").pop()) && !user) {
    window.location.href = "login.html";
  }

  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  if (user) {
    set("userName", user.name);
    set("userEmail", user.email);
    set("userPhone", user.phone);
    set("userBalance", "R" + user.balance);
    const greetName = document.getElementById("greetName");
    if (greetName) greetName.textContent = user.name;
  }

  // Logout function
  const logoutButtons = document.querySelectorAll(".logoutBtn");
  logoutButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "login.html";
    });
  });
});

// Console message helper
function showConsoleMessage(message, color = "red") {
  const consoleDiv = document.getElementById("console-message");
  if (consoleDiv) {
    consoleDiv.textContent = message;
    consoleDiv.style.color = color;
  }
}
