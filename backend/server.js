require("dotenv").config();
const http = require("http");
const os = require("os");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const initSocket = require("./sockets/socketHandler");

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const getLocalNetworkAddress = () => {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const info of interfaces[name] || []) {
      if (info.family === "IPv4" && !info.internal) {
        return info.address;
      }
    }
  }

  return "127.0.0.1";
};

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

initSocket(io);
app.set("io", io);

const startServer = async () => {
  const localAddress = getLocalNetworkAddress();

  server.listen(PORT, HOST, () => {
    console.log(`🚀 SkillBridge AI Server is listening on port ${PORT}`);
    console.log(`   Local: http://localhost:${PORT}`);
    console.log(`   Network: http://${localAddress}:${PORT}`);
  });

  connectDB().catch((err) => {
    console.warn("MongoDB connection background warning:", err.message);
  });
};

startServer();