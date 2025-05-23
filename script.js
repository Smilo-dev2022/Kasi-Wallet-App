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
      // Get input values from the new input fields
      const phoneOrEmail = document.getElementById("phoneInput")?.value.trim() || "";
      const password = document.getElementById("passwordInput")?.value || "";
      if (!phoneOrEmail || !password) {
        showConsoleMessage("Please enter both phone/email and password.", "orange");
        return;
      }
      // Simulate login success (replace with real auth logic)
      if ((phoneOrEmail === "thabo@example.com" || phoneOrEmail === "072-123-4567") && password === "password123") {
        localStorage.setItem("user", JSON.stringify({
          name: "Thabo M.",
          email: "thabo@example.com",
          phone: "072-123-4567",
          balance: "459.00"
        }));
        showConsoleMessage("Login successful! Redirecting...", "green");
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);
      } else {
        showConsoleMessage("Invalid phone/email or password.", "red");
      }
    });
  }
});
