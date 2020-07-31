global.config = require(process.env.NODE_ENV === "production" ? "./config-prod" : "./config-dev");
const express = require("express");
const authController = require(`./controllers/auth-controller`);
const vacationController = require("./controllers/vacation-controller");
const socketIO = require("socket.io");
const cors = require("cors");
const server = express();
const path = require(`path`);

server.use(cors());

server.use(express.json());

server.use(express.static(path.join(__dirname, "./_front-end")));

server.use("/api/auth", authController);
server.use("/api/vacations", vacationController);

server.use("*",(request,response)=>{
  response.sendFile(path.join(__dirname,"./_front-end/index.html"));
})


const port = process.env.PORT || 3000;


const listener = server.listen(port, () =>
  console.log(`Listening on http://localhost:${port}`)
);

global.socketServer = socketIO(listener);

socketServer.sockets.on("connection", (socket) => {
  console.log("Client has been connected.");

  // Listen to client disconnect:
  socket.on("disconnect", () => {
    console.log("Client has been disconnected.");
  });
});
