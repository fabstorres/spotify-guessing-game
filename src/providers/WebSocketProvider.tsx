import { createContext, useContext, useRef, useState } from "react";

export type WebSocketContextType = {
    socket: WebSocket | null;
    state: "disconnected" | "connecting" | "connected" | "error";
    error: string | null;
    connect: (roomCode: string) => void;
}

export const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const socket = useRef<WebSocket | null>(null);
    const [state, setState] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected");
    const [error, setError] = useState<string | null>(null);

    const connect = (roomCode: string) => {
        socket.current = new WebSocket(`ws://localhost:3000/ws/game?roomCode=${roomCode}`);
        socket.current.onopen = () => {
            setState("connected");
        };
        socket.current.onclose = () => {
            setState("disconnected");
        };
        socket.current.onerror = () => {
            setState("error");
            setError("Socket error");
        };
    }

    return (
        <WebSocketContext.Provider value={{ socket: socket.current, state, error, connect }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocket() {
    const ctx = useContext(WebSocketContext);
    if (!ctx) throw new Error("useWebSocket must be used inside WebSocketProvider");
    return ctx;
}