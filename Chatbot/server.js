
const express = require("express");
const Groq = require("groq-sdk");
require("dotenv").config();

const app = express();
const port = 3000;

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

app.use(express.json({ limit: "100kb" }));
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
    try {
        const { messages } = req.body;

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                error: "Please enter a message."
            });
        }

        const safeMessages = messages
            .filter(m =>
                ["user", "assistant"].includes(m.role) &&
                typeof m.content === "string"
            )
            .slice(-20)
            .map(m => ({
                role: m.role,
                content: m.content.slice(0, 4000)
            }));

        if (!safeMessages.length ||
            safeMessages[safeMessages.length - 1].role !== "user") {
            return res.status(400).json({
                error: "Invalid message."
            });
        }

        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI assistant. Give clear, friendly and accurate answers."
                },
                ...safeMessages
            ],
            temperature: 0.7,
            max_completion_tokens: 2048
        });

        const reply =
            completion.choices[0].message.content;

        res.json({ reply });

    } catch (error) {
        console.error("Groq API error:", error.message);

        res.status(500).json({
            error: "Something went wrong. Please try again."
        });
    }
});

app.listen(port, () => {
    console.log(`Chatbot running at http://localhost:${port}`);
});
