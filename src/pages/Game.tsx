import { useWebSocket } from "@/providers/WebSocketProvider";

export default function Game() {
    const { messages } = useWebSocket();
    return (
        <div>
            <h1>Game</h1>
            <ul>
                {messages.map((message, index) => (
                    <li key={index}>{message}</li>
                ))}
            </ul>
        </div>
    );
}