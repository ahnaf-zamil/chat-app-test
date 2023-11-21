export interface InboxInterface {
  createdAt: string;
  name: string;
  id: string; // Session ID
  email: string;
}

interface InboxProps {
  onSessionSelect: (sessionId: string) => void;
  selectedSessionId: string | undefined;
  chats: Array<InboxInterface>;
}

export const Inbox: React.FC<InboxProps> = ({
  onSessionSelect,
  selectedSessionId,
  chats,
}) => {
  return (
    <div className="w-full h-full">
      {chats.length == 0 && (
        <p className="flex items-center justify-center h-full text-xl">
          No converstions found
        </p>
      )}
      {chats.map((c) => (
        <p
          onClick={() => onSessionSelect(c.id)}
          className={`${
            selectedSessionId === c.id ? "bg-gray-300" : ""
          } hover:bg-gray-200 hover:cursor-pointer py-6 px-8 text-xl text-ellipsis overflow-hidden whitespace-nowrap`}
        >
          {c.name}
        </p>
      ))}
    </div>
  );
};
