const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 5001;
const MONGO_URI =
  "mongodb+srv://venkygowdru99:venkat%401999@message-cluster.m9sjfn4.mongodb.net/?retryWrites=true&w=majority&appName=message-cluster";

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Models
const User = require("./models/User");
const Message = require("./models/Message");

// Routes
app.use("/api/users", require("./routes/users"));
app.use("/api/messages", require("./routes/messages"));

// Socket.io
io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const message = new Message({ senderId, receiverId, text });
    message.save().then(() => {
      io.emit("receiveMessage", message);
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
