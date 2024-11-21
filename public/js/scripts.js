document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  form.addEventListener("submit", (e) => {
    const firstname = document.getElementById("firstname").value.trim();
    const lastname = document.getElementById("lastname").value.trim();
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const state = document.getElementById("state").value;
    const country = document.getElementById("country").value;

    let errorMessage = "";

    if (
      !firstname ||
      !lastname ||
      !email ||
      !username ||
      !password ||
      !state ||
      !country
    ) {
      errorMessage += "All fields are required.\n";
    }
    if (password !== confirmPassword) {
      errorMessage += "Passwords do not match.\n";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      errorMessage += "Invalid email format.\n";
    }

    if (errorMessage) {
      e.preventDefault();
      alert(errorMessage);
    }
  });
});
