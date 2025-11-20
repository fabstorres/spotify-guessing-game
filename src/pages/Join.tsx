import { useWebSocket } from "@/providers/WebSocketProvider";
import { useNavigate } from "react-router";

export default function Join() {
    const { connect } = useWebSocket();
    const navigate = useNavigate();
    async function onSubmitCreateAction(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const res = await fetch("/api/games/create", {
            method: "POST",
        });
        if (!res.ok) {
            window.location.href = "/spotify/login";
            return;
        }
        const data = await res.json();
        const roomCode = data.roomCode as string;
        connect(roomCode);
        navigate(`/game/${roomCode}`);
    }

    async function onSubmitJoinAction(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const res = await fetch("/api/games/join", {
            method: "POST",
            body: JSON.stringify({ roomCode: e.currentTarget.roomCode.value }),
        });
        if (!res.ok) {
            window.location.href = "/spotify/login";
            return;
        }
        const data = await res.json();
        const roomCode = data.roomCode as string;
        connect(roomCode);
        navigate(`/game/${roomCode}`);
    }

    return (
        <main className="flex flex-col gap-4 items-center justify-center h-screen">
            <form onSubmit={onSubmitCreateAction}>
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    Create a room
                </button>
            </form>
            <p>or</p>

            <form onSubmit={onSubmitJoinAction} className="flex gap-2">
                <input name="roomCode" type="text" placeholder="Room code" className="border border-gray-300 rounded px-2 py-1" />
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    Join a room
                </button>
            </form>

        </main>
    );
}