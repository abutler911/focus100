document.addEventListener("DOMContentLoaded", () => {
  // Attach click event to each day button
  document.querySelectorAll(".day").forEach((dayElement) => {
    dayElement.addEventListener("click", async () => {
      const day = parseInt(dayElement.dataset.day, 10);
      const amount = day;
      const isSaved = dayElement.classList.contains("btn-success");
      const action = isSaved ? "remove" : "add";

      try {
        const response = await fetch("/savings/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ day, amount, action }),
        });

        if (response.ok) {
          const { totalSaved } = await response.json();

          if (action === "add") {
            dayElement.classList.remove("btn-light");
            dayElement.classList.add("btn-success");
            dayElement.innerHTML = `$${day}`;
          } else {
            dayElement.classList.remove("btn-success");
            dayElement.classList.add("btn-light");
            dayElement.innerHTML = `$${day}`;
          }

          const totalSavedElement = document.querySelector(
            "#total-saved-display"
          );
          if (totalSavedElement) {
            totalSavedElement.textContent = `Total Saved: $${totalSaved} out of $5050`;
          }

          // Update the progress bar
          const progress = (totalSaved / 5050) * 100;
          document.getElementById("progress-bar").style.width = `${progress}%`;
          document
            .getElementById("progress-bar")
            .setAttribute("aria-valuenow", progress.toFixed(0));
          document.getElementById(
            "progress-percentage"
          ).textContent = `${progress.toFixed(0)}%`;
        } else {
          console.error("Failed to update savings entry.");
        }
      } catch (err) {
        console.error("Error updating savings entry:", err);
      }
    });
  });

  // Reset button functionality with confirmation prompt
  document
    .getElementById("confirm-reset-button")
    .addEventListener("click", async () => {
      try {
        const response = await fetch("/savings/reset", {
          method: "POST",
        });

        if (response.ok) {
          // Close the modal and reload the page
          const resetModal = bootstrap.Modal.getInstance(
            document.getElementById("resetModal")
          );
          resetModal.hide();
          location.reload();
        } else {
          console.error("Failed to reset savings data.");
        }
      } catch (err) {
        console.error("Error resetting savings data:", err);
      }
    });
});
