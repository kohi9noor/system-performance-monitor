import { Socket } from "socket.io";

export function SocketEventer(socket: Socket) {
  socket.on("perData", (data) => {
    console.log(data);
    socket.emit("getData", data);
  });
}
