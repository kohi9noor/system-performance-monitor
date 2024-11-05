import express, { Request, Response } from "express";
import cluster from "cluster";
import os from "os";
import socketio from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import http from "http";
import { Socket } from "socket.io";
import cors from "cors";

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died, forking a new one.`);
    cluster.fork();
  });
} else {
  const pubClient = new Redis({ host: "localhost", port: 6379 });
  const subClient = pubClient.duplicate();

  const app = express();
  app.use(cors({ origin: "*", credentials: true }));

  const server = http.createServer(app);

  const io = new socketio.Server(server, {
    cors: { origin: "*", credentials: true },
    transports: ["websocket", "polling"],
  });

  app.get("/", (req: Request, res: Response) => {
    res.send("Hello from worker " + process.pid);
  });

  io.on("connection", (socket: Socket) => {
    console.log("Client connected");

    socket.on("perData", (data) => {
      async function check() {
        if (data) {
          socket.emit("getData", data);
        }
      }
      check();
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Worker ${process.pid} listening on port ${PORT}`);
  });
}
