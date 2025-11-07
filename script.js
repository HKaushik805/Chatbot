// -------------------------------
// 💬 Chatbot Core Functionality
// -------------------------------
document.getElementById("send-btn").addEventListener("click", sendMessage);
document.getElementById("user-input").addEventListener("keypress", function (e) {
  if (e.key === "Enter") sendMessage();
});

// Function to get current time
function getTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Append message to chat box
function appendMessage(sender, text) {
  const chatBox = document.getElementById("chat-box");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add(sender === "user" ? "user-message" : "bot-message");

  const msgText = document.createElement("span");
  msgText.innerText = text;

  // Timestamp element
  const time = document.createElement("div");
  time.classList.add("timestamp");
  time.innerText = getTime();

  messageDiv.appendChild(msgText);
  messageDiv.appendChild(time);
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Send message handler
function sendMessage() {
  const input = document.getElementById("user-input");
  const msg = input.value.trim();
  if (msg === "") return;

  appendMessage("user", msg);
  input.value = "";

  // Typing indicator
  const chatBox = document.getElementById("chat-box");
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("bot-message");
  typingDiv.innerText = "💭 Bot is typing...";
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Fetch response from backend
  fetch(`http://127.0.0.1:5000/get?msg=${encodeURIComponent(msg)}`)
    .then((res) => res.json())
    .then((data) => {
      chatBox.removeChild(typingDiv); // Remove typing indicator

      // Handle both single-label and multi-label cases
      let responseText = `🧠 Tokens: ${data.tokens.join(", ")}\n`;

      if (data.multi_category && data.multi_category.length > 0) {
        responseText += `🏷️ Predicted Categories (Multi-label): ${data.multi_category.join(", ")}`;
      } else {
        responseText += `🏷️ Predicted Category: ${data.category}`;
      }

      appendMessage("bot", responseText);
    })
    .catch(() => {
      chatBox.removeChild(typingDiv);
      appendMessage("bot", "⚠️ Could not connect to NLP model. Start the backend.");
    });
}

// -------------------------------
// ⚙️ Menu and Clear Chat Functionality
// -------------------------------
const menuBtn = document.getElementById("menu-btn");
const menuOptions = document.getElementById("menu-options");
const clearBtn = document.getElementById("clear-btn");

menuBtn.addEventListener("click", () => {
  menuOptions.classList.toggle("show"); // Toggle visibility
});

clearBtn.addEventListener("click", () => {
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = '<div class="bot-message">🧹 Chat cleared!</div>';
  menuOptions.classList.remove("show");
});

// Hide menu when clicking outside
document.addEventListener("click", (e) => {
  if (!menuOptions.contains(e.target) && !menuBtn.contains(e.target)) {
    menuOptions.classList.remove("show");
  }
});
