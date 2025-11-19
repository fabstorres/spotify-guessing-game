export default function Join() {
    return (
        <main className="flex flex-col gap-4 items-center justify-center h-screen">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                Create a room
            </button>
            <p>or</p>
            <div className="flex gap-2">
                <input type="text" placeholder="Room code" className="border border-gray-300 rounded px-2 py-1" />
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    Join a room
                </button>
            </div>
        </main>
    );
}