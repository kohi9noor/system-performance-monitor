import { Socket } from "socket.io";

export function SocketEventer(socket: Socket) {
  socket.on("perData", (data) => {
    console.log(data);
  });

  socket.on("clinetAuth", (key) => {
    if (key === "iakjdkhjaskdhjaihs23232349") {
      socket.join("clients");
    } else if (key === "ajksdhjashdjh") {
      // valid ui client has joined
      socket.join("ui");
    } else {
      // an invalid client has joined Goodbye

      socket.disconnect(true);
    }
  });
}
