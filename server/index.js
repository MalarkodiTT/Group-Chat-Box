const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();

// --- 1. CORS Configuration ---
// Indha link unga frontend-oda Render link-ah irukkanum
const FRONTEND_URL = "https://group-chat-box-1.onrender.com";

app.use(cors({
    origin: FRONTEND_URL, 
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express.json());

const server = http.createServer(app);

// --- 2. Socket.io Configuration ---
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected!"))
    .catch(err => console.log("❌ DB Error:", err));

// Message Schema & Model
const Message = mongoose.model('Message', new mongoose.Schema({
    sender: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
}));

// API Routes
app.get("/api/messages", async (req, res) => {
    const messages = await Message.find();
    res.json(messages);
});

app.post("/api/messages", async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        await newMessage.save();
        res.json(newMessage);
    } catch (err) {
        res.status(500).json({ error: "Failed to save message" });
    }
});

// Socket Logic
io.on("connection", (socket) => {
    socket.on("send_message", (data) => {
        io.emit("receive_message", data);
    });
});

// --- 3. Port Configuration ---
// Render-la port dynamic-ah irukkum, adhanaala process.env.PORT mukkiyam
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  
