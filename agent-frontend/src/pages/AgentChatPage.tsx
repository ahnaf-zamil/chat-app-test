import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SettingsModalComponent } from "../components/SettingsModalComponent";
import config from "../config";
import io from "socket.io-client";
import { IChatMsg, ChatBox } from "../components/ChatboxComponent";
import { Inbox, InboxInterface } from "../components/InboxComponent";
import axios from "axios";

export const AgentChatPage: React.FC = () => {
  const agentId = localStorage.getItem("agentId");
  const navigate = useNavigate();
  const [socket, setSocket] = useState<any>();
  const [isSettingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [isConnected, setConnected] = useState<boolean>(false);

  const [selectedSessionId, setSelectedSessionId] = useState<string>();

  const [chatMsg, setChatMsg] = useState<IChatMsg>({});
  const [chats, setChats] = useState<Array<InboxInterface>>([]);

  useEffect(() => {
    async function getInbox() {
      const resp = await axios.post(config.BACKEND_URL + "/get_agent_inbox", {
        agentId: localStorage.getItem("agentId")!,
      });

      setChats(resp.data);
    }
    getInbox();
  }, []);

  useEffect(() => {
    if (!agentId) {
      navigate("/");
    }
    if (!socket) {
      const sock = io(config.BACKEND_URL, {
        query: { agentId: agentId },
      });
      setSocket(sock);

      sock.on("connect", () => {
        console.log("Connected");
        setConnected(true);
      });

      sock.on("user_msg", (data) => {
        setChatMsg((prev) => {
          if (prev[data.sessionId]) {
            let newArr = [...prev[data.sessionId]];
            newArr.unshift({
              id: 0,
              content: data.content,
              creator: data.creator,
            });

            return {
              ...prev,
              [data.sessionId]: newArr,
            };
          }
          return prev;
        });
      });

      sock.on("session_created", (session) => {
        setChats((prev) => {
          let newArr = [...prev];
          newArr.unshift(session);
          return newArr;
        });
      });

      return () => {
        sock.off("connect");
        sock.off("user_msg");
      };
    }
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden">
      {isSettingsOpen && (
        <SettingsModalComponent onClose={() => setSettingsOpen(false)} />
      )}
      <div className="container mx-auto xl:w-[65%] bg-gray-200 h-full">
        <div className="py-6 px-10 bg-gray-600 flex justify-between">
          <div>
            <h1 className=" text-xl font-semibold">Customers Chat Portal</h1>
            <p>{isConnected ? "Connected" : "Connecting..."}</p>
          </div>
          <button
            className="bg-gray-400 shadow-xl"
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </button>
        </div>
        <div className="grid grid-cols-8 h-full">
          <div className="h-full bg-white text-gray-600 col-span-2 border divide-x border-black">
            <Inbox
              chats={chats}
              onSessionSelect={(sessionId) => setSelectedSessionId(sessionId)}
              selectedSessionId={selectedSessionId}
            />
          </div>
          <div className="h-full bg-gray-200 text-black col-span-6 flex flex-col ">
            {socket && (
              <ChatBox
                selectedSessionId={selectedSessionId}
                setChatSessionValue={(msg, sessionId) => {
                  setChatMsg({ ...chatMsg, [sessionId]: msg });
                }}
                chatMsg={chatMsg}
                socket={socket}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
