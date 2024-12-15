// Automatically remove flash messages after 5 seconds
setTimeout(() => {
  const flashMessages = document.querySelectorAll(".flash-message");
  flashMessages.forEach((msg) => {
    const alert = new Bootstrap.Alert(msg);
    alert.close();
  });
}, 10000);
