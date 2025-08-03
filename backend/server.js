const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// MongoDB Connection (we'll set up MongoDB Atlas next)
mongoose.connect('mongodb+srv://user:Hamsa%402005@cluster0.w7vb4kj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Document Schema
const DocumentSchema = new mongoose.Schema({
    content: String
});
const Document = mongoose.model('Document', DocumentSchema);

// API to Save Document
app.post('/save', async (req, res) => {
    const { content } = req.body;
    let doc = await Document.findOne();
    if (!doc) {
        doc = new Document({ content });
    } else {
        doc.content = content;
    }
    await doc.save();
    res.sendStatus(200);
});

// API to Load Document
app.get('/load', async (req, res) => {
    const doc = await Document.findOne();
    res.json({ content: doc ? doc.content : "" });
});

// Real-time Collaboration via Socket.IO
io.on('connection', (socket) => {
    console.log('User Connected');

    socket.on('send-changes', (data) => {
        socket.broadcast.emit('receive-changes', data);
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected');
    });
});

// Start Server
const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
