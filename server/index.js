const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
app.use(cors()); // Error illama irukka ithu romba mukkiyam
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
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
    const newMessage = new Message(req.body);
    await newMessage.save();
    res.json(newMessage);
});
app.use(cors({
    origin: "https://group-chat-box-1.onrender.com", // Unga frontend-oda Render link-a inga podunga
    methods: ["GET", "POST"],
    credentials: true
}));

// Socket Logic
io.on("connection", (socket) => {
    socket.on("send_message", (data) => {
        io.emit("receive_message", data);
    });
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
  
