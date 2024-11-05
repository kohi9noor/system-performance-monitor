import { useEffect } from "react";
import io from "socket.io-client";

const App = () => {
  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
      console.log("Socket connected");

      socket.on("getData", (data) => {
        console.log("Received data:", data);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <div>App</div>;
};

export default App;
