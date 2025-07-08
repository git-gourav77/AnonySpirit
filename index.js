// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const authRoutes = require("./routes/auth");
// const messageRoutes = require("./routes/messages");
// const { translateText } = require("./utils/translate");
// const app = express();
// const socket = require("socket.io");
// require("dotenv").config();

// app.use(cors());
// app.use(express.json());

// mongoose
//   .connect(process.env.MONGO_URL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("DB Connection Successful"))
//   .catch((err) => console.log(err.message));

// app.get("/ping", (_req, res) => {
//   return res.json({ msg: "Ping Successful" });
// });

// app.use("/api/auth", authRoutes);
// app.use("/api/messages", messageRoutes);

// const server = app.listen(process.env.PORT, () =>
//   console.log(`Server started on ${process.env.PORT}`)
// );

// const io = socket(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     credentials: true,
//   },
// });

// global.onlineUsers = new Map();

// io.on("connection", (socket) => {
//   global.chatSocket = socket;

//   socket.on("add-user", (userId) => {
//     onlineUsers.set(userId, socket.id);
//   });

//   // socket.on("send-msg", async (data) => {
//   //   const sendUserSocket = onlineUsers.get(data.to);
//   //   const translated = await translateText(data.msg, data.targetLang || "en");

//   //   const messagePayload = {
//   //     original: data.msg,
//   //     translated: translated,
//   //   };

//   //   if (sendUserSocket) {
//   //     socket.to(sendUserSocket).emit("msg-recieve", messagePayload);
//   //   }
//   // });

//   socket.on("send-msg", async (data) => {
//     const sendUserSocket = onlineUsers.get(data.to);
//     try {
//       const translated = await translateText(data.msg, data.targetLang);

//       // Save both original and translated to MongoDB
//       await Messages.create({
//         message: {
//           original: data.msg,
//           translated: translated,
//         },
//         users: [data.from, data.to],
//         sender: data.from,
//       });

//       // Emit translated message to receiver
//       if (sendUserSocket) {
//         socket.to(sendUserSocket).emit("msg-recieve", {
//           msg: translated,
//           original: data.msg,
//           from: data.from,
//         });
//       }
//     } catch (err) {
//       console.error("❌ Real-time translation failed:", err.message);
//     }
//   });
// });



const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const { translateText } = require("./utils/translate");
const Messages = require("./models/messageModel"); // ✅ ADDED
const app = express();
const socket = require("socket.io");
require("dotenv").config();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connection Successful"))
  .catch((err) => console.log(err.message));

app.get("/ping", (_req, res) => {
  return res.json({ msg: "Ping Successful" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);

const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`🟢 ${userId} added with socket ID: ${socket.id}`);
  });

  socket.on("send-msg", async (data, callback) => {
    try {
      const translated = await translateText(data.msg, data.targetLang);

      await Messages.create({
        message: {
          original: data.msg,
          translated,
        },
        users: [data.from, data.to],
        sender: data.from,
      });

      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-recieve", {
          translated,
          original: data.msg,
          from: data.from,
        });
      }

      if (typeof callback === "function") {
        callback({ translated });
      }
    } catch (err) {
      console.error("Socket error:", err.message);
      if (typeof callback === "function") {
        callback({ translated: data.msg });
      }
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    console.log("❌ Socket disconnected:", socket.id);
  });
});
