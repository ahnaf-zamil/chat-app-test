import React, { SyntheticEvent, useEffect } from "react";

interface Props {
  onClose: () => void;
}

export const SettingsModalComponent: React.FC<Props> = ({ onClose }) => {
  const handleSettingsSave = async (e: SyntheticEvent) => {
    e.preventDefault();

    // Save settings here

    onClose();
  };

  return (
    <div className="text-black absolute w-screen h-screen overflow-hidden bg-black/50 flex flex-col items-center justify-center">
      <div className="bg-white md:w-[60%] w-full py-6 rounded shadow-2xl">
        <div className="md:w-[70%] mx-auto px-6">
          <h1 className="text-center text-3xl">Settings</h1>
          <div>
            <h3 className="text-xl ">Configure Chat Recipient</h3>
            <p></p>
            <div className="mt-6">
              <div className="flex items-center mb-4">
                <input
                  id="default-radio-1"
                  type="radio"
                  value=""
                  name="default-radio"
                  className="w-4 h-4"
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
                  checked
                  id="default-radio-2"
                  type="radio"
                  value=""
                  name="default-radio"
                  className="w-4 h-4"
                />
                <label
                  htmlFor="default-radio-2"
                  className="ms-2 text-sm font-medium"
                >
                  Live Agents
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-10">
            <button
              className="px-6 py-3 bg-teal-500 text-white text-xl shadow-2xl"
              onClick={handleSettingsSave}
            >
              Save
            </button>
            <button
              className="block px-6 py-3 bg-red-400 text-white text-xl shadow-2xl"
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
