import React, { SyntheticEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config";

export const AgentLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>();

  const handleFormSubmit = async (e: SyntheticEvent) => {
    setError("");
    e.preventDefault();
    // Create session for user
    try {
      const resp = await axios.post(
        config.BACKEND_URL + "/get_agent_credentials",
        {
          username,
          password,
        }
      );
      localStorage.setItem("agentId", resp.data.id);
      navigate("/chat");
    } catch (e) {
      if (axios.isAxiosError(e)) {
        setError(e.response?.data.error);
      } else {
        console.log(e);
      }
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden">
      <div className="container h-full mx-auto flex flex-col justify-center items-center">
        <form
          onSubmit={handleFormSubmit}
          className="bg-white text-gray-800 p-8 rounded"
        >
          {error && (
            <div className="mb-4 py-2 bg-red-400 px-4 w-full text-white">
              Error: {error}
            </div>
          )}
          <h2 className="text-xl">Agent Login Portal</h2>
          <input
            className="w-full text-xl bg-gray-200 block my-4 p-2"
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
          />
          <input
            className="w-full text-xl bg-gray-200 block my-4 p-2"
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
          <div className="w-full">
            <button className="block px-6 mx-auto py-3 bg-blue-400 text-white text-xl">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
