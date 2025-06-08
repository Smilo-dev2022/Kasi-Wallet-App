function showConsoleMessage(message, color = 'red') {
  const consoleDiv = document.getElementById('console-message');
  if (consoleDiv) {
    consoleDiv.textContent = message;
    consoleDiv.style.color = color;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      if (!email || !password) {
        showConsoleMessage('Please enter both email and password.');
        return;
      }
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem('token', data.token);
          showConsoleMessage('Login successful!', 'green');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 500);
        } else {
          showConsoleMessage(data.message || 'Invalid credentials');
        }
      } catch (err) {
        showConsoleMessage('Network error');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value.trim();
      if (!name || !email || !password) {
        document.getElementById('register-message').textContent = 'All fields required';
        return;
      }
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem('token', data.token);
          window.location.href = 'index.html';
        } else {
          document.getElementById('register-message').textContent = data.message || 'Registration failed';
        }
      } catch {
        document.getElementById('register-message').textContent = 'Network error';
      }
    });
  }

  const token = localStorage.getItem('token');
  if (['index.html', 'profile.html'].includes(window.location.pathname.split('/').pop()) && !token) {
    window.location.href = 'login.html';
    return;
  }
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  async function loadProfile() {
    try {
      const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      set('userName', data.name);
      set('userEmail', data.email);
      set('userPhone', data.phone || '---');
      set('userBalance', 'R' + (data.balance || 0).toFixed(2));
    } catch {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    }
  }

  async function loadTransactions() {
    try {
      const res = await fetch('/api/transactions', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const tx = await res.json();
      const body = document.getElementById('txnBody');
      if (body) {
        body.innerHTML = '';
        tx.forEach(t => {
          const tr = document.createElement('tr');
          const date = new Date(t.createdAt).toLocaleDateString();
          tr.innerHTML = `<td>${date}</td><td>${t.type}</td><td>R${t.amount.toFixed(2)}</td>`;
          body.appendChild(tr);
        });
      }
    } catch {
      /* ignore */
    }
  }
  if (token && ['index.html', 'profile.html'].includes(window.location.pathname.split('/').pop())) {
    loadProfile();
    if (window.location.pathname.split('/').pop() === 'profile.html') {
      loadTransactions();
    }
  }

  const logoutButtons = document.querySelectorAll('.logoutBtn');
  logoutButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
  });

  // PayFast checkout integration
  const openCheckout = async (amount) => {
    try {
      const res = await fetch('/api/payfast-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert('Could not start checkout');
      }
    } catch (err) {
      alert('Checkout error');
    }
  };

  const sendMoneyBtn = document.getElementById('sendMoneyBtn');
  if (sendMoneyBtn) {
    sendMoneyBtn.addEventListener('click', () => openCheckout(100));
  }

  const buyAirtimeBtn = document.getElementById('buyAirtimeBtn');
  if (buyAirtimeBtn) {
    buyAirtimeBtn.addEventListener('click', () => openCheckout(50));
  }

  const transferForm = document.getElementById('transferForm');
  if (transferForm) {
    transferForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('transferEmail').value.trim();
      const amount = parseFloat(document.getElementById('transferAmount').value);
      if (!email || !amount) return alert('All fields required');
      try {
        const res = await fetch('/api/transfers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ to: email, amount })
        });
        const data = await res.json();
        if (res.ok) {
          alert('Transfer successful');
          loadProfile();
          loadTransactions();
        } else {
          alert(data.message || 'Transfer failed');
        }
      } catch {
        alert('Network error');
      }
    });
  }

  const voucherForm = document.getElementById('voucherForm');
  if (voucherForm) {
    voucherForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const amount = parseFloat(document.getElementById('voucherAmount').value);
      const phone = document.getElementById('voucherPhone')?.value.trim();
      if (!amount) return alert('Enter amount');
      try {
        const res = await fetch('/api/vouchers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ amount, phone })
        });
        const data = await res.json();
        if (res.ok) {
          document.getElementById('voucherCode').textContent = `Code: ${data.code}`;
          loadProfile();
          loadTransactions();
        } else {
          alert(data.message || 'Failed to generate');
        }
      } catch {
        alert('Network error');
      }
    });
  }

  const redeemForm = document.getElementById('redeemForm');
  if (redeemForm) {
    redeemForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = document.getElementById('redeemCode').value.trim();
      if (!code) return;
      try {
        const res = await fetch('/api/vouchers/redeem', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ code })
        });
        const data = await res.json();
        if (res.ok) {
          document.getElementById('redeemMessage').textContent = 'Redeemed!';
          loadProfile();
          loadTransactions();
        } else {
          document.getElementById('redeemMessage').textContent = data.message || 'Error';
        }
      } catch {
        document.getElementById('redeemMessage').textContent = 'Network error';
      }
    });
  }
});
