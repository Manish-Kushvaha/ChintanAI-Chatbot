import express from 'express';
import Thread from '../models/Thread.js';
import getOpenAIAPIResponse from '../utils/openai.js';

const router = express.Router();

// Test route
router.post("/test", async (req, res) => {
    try {
        const thread = new Thread({
            user: req.user?._id, // optional, link test thread to user if logged in
            threadId: "2004sham",
            title: "Testing New Thread2"
        });

        const response = await thread.save();
        res.send(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to save in DB" });
    }
});

// Get all threads of logged-in user
router.get("/thread", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "User not authenticated" });

    try {
        const threads = await Thread.find({ user: req.user._id }).sort({ updatedAt: -1 });
        res.json(threads);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch threads" });
    }
});

// Get a specific thread by threadId for logged-in user
router.get("/thread/:threadId", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "User not authenticated" });

    const { threadId } = req.params;

    try {
        const thread = await Thread.findOne({ threadId, user: req.user._id });
        if (!thread) return res.status(404).json({ error: "Thread not found" });

        res.json(thread.messages);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch chat" });
    }
});

// Delete a thread
router.delete("/thread/:threadId", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "User not authenticated" });

    const { threadId } = req.params;

    try {
        const deletedThread = await Thread.findOneAndDelete({ threadId, user: req.user._id });
        if (!deletedThread) return res.status(404).json({ error: "Thread not found" });

        res.status(200).json({ success: "Thread deleted successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to delete thread" });
    }
});



router.post("/chat", async (req, res) => {
    const { message, threadId } = req.body; // get threadId from frontend

    if (!req.user) return res.status(401).json({ error: "User not authenticated" });
    if (!message) return res.status(400).json({ error: "Message is required" });

    try {
        const userId = req.user._id;

        let thread;

        if (threadId) {
            // If threadId is provided, try to find it
            thread = await Thread.findOne({ threadId, user: userId });
        }

        if (!thread) {
            // If no thread found or threadId not provided, create new
            const newThreadId = new Date().getTime().toString(); // or use uuid
            thread = new Thread({
                user: userId,
                threadId: newThreadId,
                title: message,
                messages: [{ role: "user", content: message }]
            });
        } else {
            // Append to existing thread
            thread.messages.push({ role: "user", content: message });
        }

        // Get assistant reply
        const assistantReply = await getOpenAIAPIResponse(message);
        thread.messages.push({ role: "assistant", content: assistantReply });
        thread.updatedAt = new Date();

        await thread.save();

        res.json({ reply: assistantReply, threadId: thread.threadId });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Something went wrong" });
    }
});


export default router;
