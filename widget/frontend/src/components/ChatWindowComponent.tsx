import { useState, useEffect } from "preact/hooks";
import { FC } from "preact/compat";
import { io } from "socket.io-client";
import config from "../config";

interface Props {
  sessionId: string;
  onSessionTimeout: () => void;
}

export const ChatWindowComponent: FC<Props> = ({
  sessionId,
  onSessionTimeout,
}) => {
  const [msgInput, setMsgInput] = useState<string>("");
  const [isConnected, setConnected] = useState<boolean>(false);

  const [chatMsg, setChatMsg] = useState<
    Array<{ content: string; isAgent: boolean }>
  >([]);

  const socket = io(config.BACKEND_URL, {
    query: { sessionId },
  });

  useEffect(() => {
    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("agent_reply", (resp) => {
      setChatMsg((oldmsg) => [...oldmsg, { content: resp, isAgent: true }]);
    });
    socket.on("session_timeout", () => {
      console.log("Session has timed out");
      onSessionTimeout();
      alert("Session timed out");
    });

    return () => {
      socket.off("connect");
      socket.off("agent_reply");
      socket.off("session_timeout");
    };
  }, []);

  useEffect(() => {
    const chatwin = document.getElementById("chat-window");
    chatwin.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [chatMsg]);

  const handleMsgSubmit = (e: Event) => {
    e.preventDefault();
    setMsgInput("");
    if (/\S/.test(msgInput)) {
      setChatMsg((oldmsg) => [
        ...oldmsg,
        { content: msgInput, isAgent: false },
      ]);
      socket.emit("msg", msgInput);
    }
  };

  return (
    <div className={"overflow-hidden "}>
      <div style={{ maxHeight: "87vh" }} className={"overflow-y-scroll"}>
        <div
          id={"chat-window"}
          className="chat-msgs m-4 flex flex-col justify-end"
        >
          {chatMsg.map((msg) => {
            return (
              <div
                className={`w-full flex justify-${
                  msg.isAgent ? "start" : "end"
                }`}
              >
                <div className={`block mb-3`}>
                  <p
                    className={`bg-${
                      msg.isAgent ? "gray" : "green"
                    }-400 p-2 rounded-md	inline-flex`}
                    dangerouslySetInnerHTML={{
                      __html: msg.content.replace(/\n/g, "<br />"),
                    }}
                  ></p>
                </div>
              </div>
            );
          })}
          <div id="scrolltolast"></div>
        </div>
        <form className={"fixed bottom-0 mx-2 mb-1 left-0 right-0"}>
          <small className={"text-center"}>
            {isConnected ? "Connected" : "Connecting..."}
          </small>
          <div className="flex">
            <input
              type="text"
              value={msgInput}
              onChange={(e) => setMsgInput(e.currentTarget.value)}
              className={"w-full"}
              maxLength={500}
              required
            />
            <button
              onClick={handleMsgSubmit}
              type="submit"
              className={"bg-blue-500 w-20 h-10"}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
