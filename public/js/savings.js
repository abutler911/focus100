document.addEventListener("DOMContentLoaded", () => {
  // Attach click event to each day button
  document.querySelectorAll(".day").forEach((dayElement) => {
    dayElement.addEventListener("click", async () => {
      const day = parseInt(dayElement.dataset.day, 10);
      const amount = day; // Amount corresponds to the day number

      try {
        const response = await fetch("/savings/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ day, amount }),
        });

        if (response.ok) {
          dayElement.classList.remove("btn-light");
          dayElement.classList.add("btn-success");
          dayElement.innerHTML = `$${day} (Saved)`;

          // Optionally, update the total and progress bar dynamically
          const { totalSaved } = await response.json();
          document.querySelector(
            ".lead"
          ).textContent = `Total Saved: $${totalSaved} out of $5050`;
          const progress = (totalSaved / 5050) * 100;
          document.getElementById("progress-bar").style.width = `${progress}%`;
        } else {
          console.error("Failed to update savings entry.");
        }
      } catch (err) {
        console.error("Error updating savings entry:", err);
      }
    });
  });

  // Reset button functionality
  document
    .getElementById("reset-button")
    .addEventListener("click", async () => {
      try {
        const response = await fetch("/savings/reset", {
          method: "POST",
        });

        if (response.ok) {
          location.reload(); // Reload the page to reflect reset state
        }
      } catch (err) {
        console.error("Error resetting savings data:", err);
      }
    });
});
