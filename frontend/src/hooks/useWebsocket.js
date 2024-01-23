import { useState } from "react";
import Cookies from "js-cookie";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { selectId } from "slices/authSlice";

const socketUrl = process.env.WEBSOCKET_URL || "ws://localhost:5000";
const socket = io(`${socketUrl}`);

const useWebsocket = () => {

    const [disabled, setDisabled] = useState(false);
    const id = useSelector(selectId)

    socket.on("ban-check", (msg) => {
      if (id === msg) {
        Cookies.remove("appToken");
        setDisabled(true)
      }
    });

    return { disabled }

}

export default useWebsocket
