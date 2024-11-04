import express, { Request, Response } from "express";
import cluster from "cluster";
import os from "os";
import socketio from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import http from "http";
import { SocketEventer } from "./sockets";

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  const pubClient = new Redis({ host: "localhost", port: 6379 });
  console.log(pubClient);
  const subClient = pubClient.duplicate();

  const app = express();
  const server = http.createServer(app);

  const io = new socketio.Server(server, {
    adapter: createAdapter(pubClient, subClient),
  });

  app.get("/", (req: Request, res: Response) => {
    res.send("Hello from this worker " + process.pid);
  });

  io.on("connection", (socket) => {
    SocketEventer(socket);
  });

  const PORT = process.env.PORT || 3000;

  server.listen(PORT, () => {
    console.log(`Worker ${process.pid} listening on port ${PORT}`);
  });
}
