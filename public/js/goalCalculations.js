document.addEventListener("DOMContentLoaded", () => {
  const goalInputs = document.querySelectorAll(".daily-goal");

  goalInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      const dailyValue = parseFloat(e.target.value) || 0; // Default to 0 if input is empty or invalid
      const totalElement = document.getElementById(
        `total${capitalize(e.target.id)}`
      );
      if (totalElement) {
        totalElement.textContent = dailyValue * 100; // Update the total for 100 days
      }
    });
  });

  // Utility function to capitalize the first letter of a string
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
});
