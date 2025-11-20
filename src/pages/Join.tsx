import { useWebSocket } from "@/providers/WebSocketProvider";

export default function Join() {
    const { connect } = useWebSocket();
    async function onSubmitCreateAction(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const res = await fetch("/api/games/create", {
            method: "POST",
        });
        if (!res.ok) {
            alert(res.statusText);
            return;
        }
        const data = await res.json();
        const roomCode = data.roomCode as string;
        connect(roomCode);

    }

    async function onSubmitJoinAction(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const res = await fetch("/api/games/join", {
            method: "POST",
            body: JSON.stringify({ roomCode: e.currentTarget.roomCode.value }),
        });
        if (!res.ok) {
            alert(res.statusText);
            return;
        }
        const data = await res.json();
        const roomCode = data.roomCode as string;
        connect(roomCode);
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