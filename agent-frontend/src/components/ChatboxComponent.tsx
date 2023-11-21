import axios from "axios";
import { useState, useEffect, SyntheticEvent } from "react";
import { Socket } from "socket.io-client";
import config from "../config";

export interface IMsg {
  id: number;
  content: string;
  creator: string;
}

export interface IChatMsg {
  [session_id: string]: Array<IMsg>;
}

interface ChatboxProps {
  selectedSessionId: string | undefined;
  setChatSessionValue: (msg: Array<IMsg>, sessionId: string) => void;
  chatMsg: IChatMsg;
  socket: Socket;
}

export const ChatBox: React.FC<ChatboxProps> = ({
  selectedSessionId,
  setChatSessionValue,
  chatMsg,
  socket,
}) => {
  const [inputMsg, setInputMsg] = useState<string>();

  useEffect(() => {
    // Fetch data for newly selected inbox
    async function fetchChatContent() {
      if (selectedSessionId) {
        // Only fetching if chat msg havent been fetched yet
        if (!chatMsg[selectedSessionId]) {
          const resp = await axios.get(
            config.BACKEND_URL + "/messages/" + selectedSessionId
          );
          setChatSessionValue(resp.data, selectedSessionId);
        }
      }
    }
    fetchChatContent();
  }, [selectedSessionId]);

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (selectedSessionId) {
      setInputMsg("");

      // Send msg to API
      socket.emit("agent_msg", {
        sessionId: selectedSessionId,
        content: inputMsg,
      });

      setChatSessionValue(
        [{ id: 0, content: inputMsg!, creator: "agent" }].concat(
          chatMsg[selectedSessionId]
        ),
        selectedSessionId
      );
    }
  };

  return (
    <div className="flex flex-col h-full ">
      {selectedSessionId ? (
        <>
          <div
            id="chat-window"
            className="h-[calc(100vh-94px-60px)] overflow-y-scroll max-h-[calc(100vh-94px-60px)] p-4 flex flex-col-reverse justify-start"
          >
            {chatMsg[selectedSessionId] &&
              chatMsg[selectedSessionId].map((msg) => {
                return (
                  <div
                    className={`w-full flex justify-${
                      msg.creator == "user" ? "start" : "end"
                    }`}
                  >
                    <div className={`block mb-3`}>
                      <p
                        className={`bg-${
                          msg.creator == "user" ? "gray" : "teal"
                        }-400 p-2 rounded-md max-w-[500px]	break-words	`}
                        dangerouslySetInnerHTML={{
                          __html: msg.content.replace(/\n/g, "<br />"),
                        }}
                      ></p>
                    </div>
                  </div>
                );
              })}
          </div>
          <form
            onSubmit={handleSubmit}
            className="bg-slate-300 h-[60px] flex p-2"
          >
            <input
              type="text"
              className="bg-white flex-grow px-2"
              placeholder="Type something..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.currentTarget.value)}
              required
            />
            <button className="bg-teal-600 text-white rounded-none">
              Send
            </button>
          </form>
        </>
      ) : (
        <h1 className="p-8 text-xl">Select a conversation</h1>
      )}
    </div>
  );
};
