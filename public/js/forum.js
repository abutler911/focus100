document.addEventListener("DOMContentLoaded", () => {
  const contentInput = document.getElementById("content");
  if (!contentInput) {
    console.error("Element with id 'content' not found.");
    return;
  }

  const mentionDropdown = document.createElement("ul");
  mentionDropdown.classList.add("mention-dropdown");
  document.body.appendChild(mentionDropdown);

  let cursorPosition = 0;

  contentInput.addEventListener("keyup", async () => {
    const cursorIndex = contentInput.selectionStart;
    cursorPosition = cursorIndex;

    const value = contentInput.value.slice(0, cursorIndex);
    const match = value.match(/@\w*$/);

    if (match) {
      const query = match[0].slice(1).trim();

      if (!query) {
        mentionDropdown.innerHTML = "";
        return;
      }

      try {
        const response = await fetch(`/users/search?query=${query}`);
        if (response.ok) {
          const users = await response.json();
          updateDropdown(users, match, cursorIndex, value);
        } else {
          console.error("Failed to fetch users:", response.statusText);
        }
      } catch (err) {
        console.error("Error fetching users:", err.message);
      }
    } else {
      mentionDropdown.innerHTML = "";
    }
  });

  const updateDropdown = (users, match, cursorIndex, value) => {
    mentionDropdown.innerHTML = "";

    if (users.length === 0) {
      mentionDropdown.style.display = "none";
      return;
    }

    users.forEach((user) => {
      const item = document.createElement("li");
      item.textContent = user.username;
      item.classList.add("mention-item");
      item.addEventListener("click", () => {
        const beforeMention = value.slice(0, match.index);
        const afterMention = contentInput.value.slice(cursorIndex);
        contentInput.value = `${beforeMention}@${user.username} ${afterMention}`;
        mentionDropdown.innerHTML = "";
        mentionDropdown.style.display = "none";
        contentInput.focus();
        contentInput.selectionEnd =
          beforeMention.length + user.username.length + 2;
      });
      mentionDropdown.appendChild(item);
    });

    positionDropdown(contentInput, cursorIndex);
    mentionDropdown.style.display = "block";
  };

  const positionDropdown = (textarea, cursorIndex) => {
    const rect = textarea.getBoundingClientRect();
    const lineHeight =
      parseInt(window.getComputedStyle(textarea).lineHeight, 10) || 20;
    mentionDropdown.style.position = "absolute";
    mentionDropdown.style.left = `${rect.left + window.scrollX}px`;
    mentionDropdown.style.top = `${rect.top + lineHeight + window.scrollY}px`;
    mentionDropdown.style.zIndex = "1000";
  };

  contentInput.addEventListener("blur", () => {
    setTimeout(() => {
      mentionDropdown.innerHTML = "";
      mentionDropdown.style.display = "none";
    }, 200);
  });

  mentionDropdown.addEventListener("mousedown", (e) => {
    e.preventDefault();
  });

  const notificationsDropdown = document.getElementById(
    "notificationsDropdown"
  );
  if (notificationsDropdown) {
    notificationsDropdown.addEventListener("click", async () => {
      try {
        await fetch("/notifications/read", { method: "POST" });
        const badge = document.querySelector(".navbar .badge");
        if (badge) badge.remove();
      } catch (err) {
        console.error("Error marking notifications as read:", err);
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const voteButtons = document.querySelectorAll(".vote-btn");

  voteButtons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      const isUpvote = button.classList.contains("upvote");
      const postId = button.closest(".forum-card").dataset.postId;

      if (!postId) {
        console.error("Post ID not found for voting");
        return;
      }

      try {
        const response = await fetch(
          `/forum/posts/${postId}/${isUpvote ? "upvote" : "downvote"}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to vote");

        const { upvotes, downvotes } = await response.json();

        const votesCountElement =
          button.parentNode.querySelector(".votes-count");
        if (isUpvote) {
          votesCountElement.textContent = upvotes; // Show updated upvotes
        } else {
          votesCountElement.textContent = downvotes; // Show updated downvotes
        }
      } catch (error) {
        console.error("Error updating vote:", error.message);
      }
    });
  });
});
