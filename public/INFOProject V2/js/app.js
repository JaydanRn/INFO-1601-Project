import { login, signUp } from './firebaseAPI.js';

// Set max date for DOB field to today
const dobInput = document.getElementById('su-dob');
if (dobInput) {
  dobInput.max = new Date().toISOString().split('T')[0];
}

// Generic form validation helpers
function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
  }
}
function clearErrors(formId) {
  document.querySelectorAll(
    `#${formId} .field-error, #${formId} .form-error`
  ).forEach(e => (e.style.display = 'none'));
}

// Login handler
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors('login-form');
    const email = document.getElementById('email-input').value.trim();
    const pw = document.getElementById('password-input').value;
    let valid = true;
    if (!email) {
      showError('error-email', 'Email is required.');
      valid = false;
    }
    if (!pw) {
      showError('error-password', 'Password is required.');
      valid = false;
    }
    if (!valid) return;
    try {
      await login(email, pw);
      window.location.href = 'home.html';
    } catch {
      showError('form-error', 'Login failed. Check your credentials.');
    }
  });
}

// Signup handler
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors('signup-form');
    const username = document.getElementById('su-username').value.trim();
    const email = document.getElementById('su-email').value.trim();
    const pw = document.getElementById('su-password').value;
    const confirm = document.getElementById('su-confirm').value;
    const dob = document.getElementById('su-dob').value;
    let valid = true;
    if (!username) {
      showError('error-username', 'Username is required.');
      valid = false;
    }
    if (!email) {
      showError('error-email', 'Email is required.');
      valid = false;
    }
    if (!pw) {
      showError('error-password', 'Password is required.');
      valid = false;
    }
    if (pw !== confirm) {
      showError('error-confirm', 'Passwords do not match.');
      valid = false;
    }
    if (!dob) {
      showError('error-dob', 'Date of birth is required.');
      valid = false;
    }
    if (!valid) return;
    try {
      await signUp({ username, email, password: pw, dob });
      window.location.href = 'home.html';
    } catch {
      showError('form-error', 'Sign‑up failed. Try again.');
    }
  });
}

// Disable logo link on login and signup pages
document.addEventListener("DOMContentLoaded", () => {
  const logoLink = document.querySelector(".ds-header__logo");

  // Check if the current page is login or signup
  const isAuthPage = document.body.classList.contains("login-bg") || document.body.classList.contains("signup-bg");

  if (isAuthPage) {
    // Disable the logo link on login and signup pages
    logoLink.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent redirection
    });
  }
});
