document.addEventListener("DOMContentLoaded", () => {
  const dayButtons = document.querySelectorAll(".day");
  const totalSavedElement = document.querySelector("#total-saved-display");
  const progressBar = document.getElementById("progress-bar");
  const progressPercentage = document.getElementById("progress-percentage");
  const resetButton = document.getElementById("confirm-reset-button");

  console.log({
    dayButtons: document.querySelectorAll(".day"),
    totalSavedElement: document.querySelector("#total-saved-display"),
    progressBar: document.getElementById("progress-bar"),
    progressPercentage: document.getElementById("progress-percentage"),
    resetButton: document.getElementById("confirm-reset-button"),
  });

  if (
    !dayButtons.length ||
    !totalSavedElement ||
    !progressBar ||
    !progressPercentage ||
    !resetButton
  ) {
    console.error("Some required elements are missing on the page.");
    return;
  }

  dayButtons.forEach((dayElement) => {
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

          totalSavedElement.textContent = `Total Saved: $${totalSaved} out of $5050`;

          const progress = (totalSaved / 5050) * 100;
          progressBar.style.width = `${progress}%`;
          progressBar.setAttribute("aria-valuenow", progress.toFixed(0));
          progressPercentage.textContent = `${progress.toFixed(0)}%`;
        } else {
          console.error("Failed to update savings entry.");
        }
      } catch (err) {
        console.error("Error updating savings entry:", err);
      }
    });
  });

  resetButton.addEventListener("click", async () => {
    try {
      const response = await fetch("/savings/reset", {
        method: "POST",
      });

      if (response.ok) {
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
