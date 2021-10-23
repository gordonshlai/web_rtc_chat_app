const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");

// socket.io is used for real time data transmission (messages, audio, video, etc)
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Server is running.");
});

io.on("connection", (socket) => {
  // 'me' is a message, it will emit when I join.
  // The frontend will receive the socket.id
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callended");
  });

  // userToCall: the id of the user that we are going to call
  socket.on("calluser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("calluser", { singal: signalData, from, name });
  });

  socket.on("answercall", (data) => {
    io.to(data.to).emit("callaccepted", data.signal);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
