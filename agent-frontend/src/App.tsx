import { createHashRouter, RouterProvider } from "react-router-dom";
import { AgentLoginPage } from "./pages/AgentLoginPage";
import { AgentChatPage } from "./pages/AgentChatPage";

const router = createHashRouter([
  {
    path: "/",
    element: <AgentLoginPage />,
  },
  {
    path: "/chat",
    element: <AgentChatPage />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
