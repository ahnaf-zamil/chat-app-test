import { useState } from "preact/hooks";
import { FC } from "preact/compat";

interface Props {
  onSubmit: (username: string, email: string) => void;
}

export const CreateSessionComponent: FC<Props> = ({ onSubmit }) => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(username, email);
      }}
      className="h-full m-4"
    >
      <h1 className={"text-xl font-semibold"}>Start a live chat</h1>
      <div className="flex my-2 flex-col items-start">
        <label htmlFor="">Your Name</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
          type="text"
          maxLength={50}
          required
        />
      </div>
      <div className="flex my-2 flex-col items-start">
        <label htmlFor="">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          type="email"
          required
        />
      </div>
      <button type="submit" className="bg-blue-400 rounded-md px-4 py-2 mt-2">
        Submit
      </button>
    </form>
  );
};
