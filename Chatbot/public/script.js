
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatBox = document.getElementById("chatBox");
const sendBtn = document.getElementById("sendBtn");
const newChat = document.getElementById("newChat");

let messages = [];

function addMessage(role, text) {

    const welcome = document.querySelector(".welcome");
    if (welcome) welcome.remove();

    const message = document.createElement("div");
    message.className = "message";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = role === "user" ? "U" : "✦";

    const content = document.createElement("div");
    content.className = "content";
    content.textContent = text;

    message.appendChild(avatar);
    message.appendChild(content);

    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;

    return content;
}

chatForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const text = userInput.value.trim();

    if (!text || sendBtn.disabled) return;

    messages.push({
        role: "user",
        content: text
    });

    addMessage("user", text);

    userInput.value = "";
    sendBtn.disabled = true;

    const loading = addMessage("assistant", "Thinking...");

    try {

        const response = await fetch("/api/chat", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                messages: messages
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Request failed");
        }

        loading.textContent = data.reply;

        messages.push({
            role: "assistant",
            content: data.reply
        });

    } catch (error) {

        loading.textContent = "Error: " + error.message;

        messages.pop();

    } finally {

        sendBtn.disabled = false;
        userInput.focus();

    }
});

// Enter to send, Shift + Enter for new line

userInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        chatForm.requestSubmit();
    }

});

// New Chat

newChat.addEventListener("click", () => {

    messages = [];

    chatBox.innerHTML = `
        <div class="welcome">
            <div class="logo">✦</div>
            <h1>How can I help you?</h1>
            <p>Ask me anything and let's explore together.</p>
        </div>
    `;

    userInput.focus();

});
