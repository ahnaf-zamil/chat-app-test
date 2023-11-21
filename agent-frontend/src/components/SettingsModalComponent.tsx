import React, { SyntheticEvent, useEffect, useState } from "react";
import axios from "axios";
import config from "../config";
import { useNavigate } from "react-router-dom";

interface Props {
  onClose: () => void;
}

export const SettingsModalComponent: React.FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();
  const [redirectToAgent, setRedirectToAgent] = useState<boolean>();

  const handleLogout = () => {
    localStorage.removeItem("agentId");
    navigate("/");
  };

  const handleSettingsSave = async (e: SyntheticEvent) => {
    e.preventDefault();

    // Save settings here
    try {
      await axios.post(config.BACKEND_URL + "/settings", {
        redirect_to_live_agent: redirectToAgent,
      });
      onClose();
    } catch (e) {
      console.log(e);
      alert("There was an error, check console.");
    }
  };

  useEffect(() => {
    async function getSettings() {
      // Fetch settings to show radio
      const resp = await axios.get(config.BACKEND_URL + "/settings");
      setRedirectToAgent(resp.data.redirect_to_live_agent);
    }
    getSettings();
  }, []);

  return (
    <div className="text-black absolute w-screen h-screen overflow-hidden bg-black/50 flex flex-col items-center justify-center">
      <div className="bg-white md:w-[60%] w-full py-6 rounded shadow-2xl">
        <div className="md:w-[70%] mx-auto px-6">
          <h1 className="text-center text-3xl">Settings</h1>
          <div>
            <h3 className="text-xl ">Configure Chat Recipient</h3>
            <p></p>
            {typeof redirectToAgent === "boolean" && (
              <div className="mt-6">
                <div className="flex items-center mb-4">
                  <input
                    id="default-radio-1"
                    type="radio"
                    value="ai"
                    name="default-radio"
                    className="w-4 h-4"
                    checked={!redirectToAgent}
                    onChange={() => setRedirectToAgent(false)}
                  />
                  <label
                    htmlFor="default-radio-1"
                    className="ms-2 text-sm font-medium "
                  >
                    Chat Bot (GPT 3.5)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="default-radio-2"
                    type="radio"
                    value="agent"
                    name="default-radio"
                    className="w-4 h-4"
                    checked={redirectToAgent}
                    onChange={() => setRedirectToAgent(true)}
                  />
                  <label
                    htmlFor="default-radio-2"
                    className="ms-2 text-sm font-medium"
                  >
                    Live Agents
                  </label>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-center gap-10 mt-10">
            <button
              className="px-4 py-2 bg-teal-500 text-white text-lg shadow-2xl"
              onClick={handleSettingsSave}
            >
              Save
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white text-lg shadow-2xl"
              onClick={handleLogout}
            >
              Logout
            </button>
            <button
              className="block px-4 py-2 bg-red-400 text-white text-lg shadow-2xl"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
