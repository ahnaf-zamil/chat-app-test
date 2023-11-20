import React, { useEffect, useState } from "react";
import { redirect, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { SettingsModalComponent } from "../components/SettingsModalComponent";

const UserList: React.FC = () => {
  return <></>;
};

const ChatBox: React.FC = () => {
  return <></>;
};

export const AgentChatPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSettingsOpen, setSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    const agentId = localStorage.getItem("agentId");
    if (!agentId) {
      navigate("/");
    }

    (async () => {
      // Fetch session information and chat content
    })();
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden">
      {isSettingsOpen && (
        <SettingsModalComponent onClose={() => setSettingsOpen(false)} />
      )}
      <div className="container mx-auto xl:w-[65%] bg-gray-200 h-full">
        <div className="py-6 px-10 bg-gray-600 flex justify-between">
          <h1 className=" text-xl font-semibold">Customers Chat Portal</h1>
          <button
            className="bg-gray-400 shadow-xl"
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </button>
        </div>
        <div className="grid grid-cols-8 h-full">
          <div className="h-full bg-green-300 col-span-2">
            <UserList />
          </div>
          <div className="h-full bg-red-300 col-span-6 flex flex-col">
            <ChatBox />
          </div>
        </div>
      </div>
    </div>
  );
};
