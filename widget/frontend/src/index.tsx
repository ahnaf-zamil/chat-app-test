import { render } from "preact";
import { useState } from "preact/hooks";
import axios from "axios";
import "./styles/style.css";
import { CreateSessionComponent } from "./components/CreateSessionComponent";
import config from "./config";
import { ChatWindowComponent } from "./components/ChatWindowComponent";

export function App() {
  const [sessionId, setSessionId] = useState<string>(null);

  const handleFormSubmit = async (username: string, email: string) => {
    // Create session for user
    const resp = await axios.post(config.BACKEND_URL + "/create_session", {
      username,
      email,
    });
    setSessionId(resp.data.id);
  };

  if (!sessionId) {
    // Return session create form
    return <CreateSessionComponent onSubmit={handleFormSubmit} />;
  }

  return (
    <ChatWindowComponent
      onSessionTimeout={() => setSessionId(null)}
      sessionId={sessionId}
    />
  );
}

render(<App />, document.getElementById("app"));
