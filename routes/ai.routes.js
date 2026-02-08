const express = require('express');
const Message = require('../models/messagemodel');
const router = express.Router();
const { runAgent } = require('../ai/agent');
const { authMiddleware } = require('../middleware/auth.middleware');

const pendingConfirmations = new Map();

router.post("/confirm/answer", authMiddleware, (req, res) => {
    const { answer } = req.body;
    const userId = req.user.userId;

    if (!userId || !pendingConfirmations.has(userId)) {
        return res.status(400).json({ ok: false, error: "No pending question for this user" });
    }

    const { resolve } = pendingConfirmations.get(userId);
    resolve(answer);
    pendingConfirmations.delete(userId);
    res.json({ ok: true });
});

// GET /confirm/question
router.get("/confirm/question", authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const pending = pendingConfirmations.get(userId);

    if (!pending) return res.json({ question: null });
    res.json({ question: pending.question });
});

router.post('/ai-chat', authMiddleware, async (req, res) => {
    const { message, name } = req.body;
    const userid = req.user.userId;
    const token = req.token;
    const history = await Message.find({ userid })
        .sort({ timestamp: -1 })
        .limit(30);

    const recentHistory = history.reverse().map(msg => ({
        role: msg.sender === "AI" ? "assistant" : "user",
        content: msg.sender === "AI" ? [
            { type: "output_text", text: msg.content }
        ] : [
            { type: "input_text", text: msg.content }
        ]
    }));


    // 1️⃣ Save user message
    const userMessage = new Message({
        sender: name,
        content: message,
        userid: userid,
        timestamp: new Date()
    });

    // 2️⃣ Generate AI reply
    let aiReplyText = await runAgent(recentHistory.concat({
        role: `user`,
        content: [
            { type: "input_text", text: message }
        ]
    }), { name, userid, token });

    function confirmFromFrontend(userid, question, timeout = 60000) {
    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            pendingConfirmations.delete(userid);
            resolve(false);
        }, timeout);

        pendingConfirmations.set(userid, {
            question,
            resolve: (answer) => {
                clearTimeout(timer);
                resolve(answer);
            }
        });
    });
}


    if (typeof aiReplyText === "string") {
        aiReplyText = {
            finalOutput: aiReplyText,
            interruptions: [],
            state: null
        };
    }
    while (aiReplyText?.interruptions?.length > 0) {
        const state = aiReplyText.state;
        if (!state) break;

        for (const interruption of aiReplyText.interruptions) {

            const confirmed = await confirmFromFrontend(
                userid, ` ${interruption.arguments}`
            );
            if (confirmed) {
                state.approve(interruption);
            } else {
                state.reject(interruption);
            }
        }
        aiReplyText = await runAgent(state, { name, userid, token });

    }
console.log("before try")
try {
    await userMessage.save();
    console.log("in try")
} catch (err) {
    console.error("User message save error:", err);
}


    const aiMessage = new Message({
        sender: "AI",
        content: aiReplyText?.finalOutput || "Sorry, I couldn't respond to this request.",
        userid: userid,
        timestamp: new Date()
    });
    await aiMessage.save();

    // 4️⃣ Return **AI message** to frontend
    res.json({ success: true, reply: aiMessage.content });
});
module.exports = router;
