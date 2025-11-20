import { Database } from "bun:sqlite";
import { Spotify } from "./spotify";

export const db = new Database(Bun.env.DB_PATH ?? "./db.sqlite", { create: true });

db.run(`
 CREATE TABLE IF NOT EXISTS users_sessions (
    session_id TEXT PRIMARY KEY,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
 )`);


export class UserSession {
    session_id!: string;
    access_token!: string;
    refresh_token!: string;
    expires_at!: number;
    created_at!: number;
}


const insertSession = db.prepare(
    `INSERT INTO users_sessions
   (session_id, access_token, refresh_token, expires_at, created_at)
   VALUES (?, ?, ?, ?, ?)`
);

const updateSession = db.prepare(
    `UPDATE users_sessions
   SET access_token = ?, refresh_token = ?, expires_at = ?
   WHERE session_id = ?`
);

const selectSession = db
    .query(
        `SELECT session_id, access_token, refresh_token, expires_at, created_at
     FROM users_sessions WHERE session_id = ?`
    )
    .as(UserSession);

export const createSession = (session_id: string, access_token: string, refresh_token: string, expires_in: number) => {
    insertSession.run(session_id, access_token, refresh_token, Math.floor(new Date().getTime() / 1000) + expires_in, Math.floor(new Date().getTime() / 1000));
};

export const getSession = async (session_id: string) => {
    const session = selectSession.get(session_id);
    if (!session) {
        return null
    }
    const now = Math.floor(new Date().getTime() / 1000)
    if (session.expires_at < now) {
        const result = await Spotify.refreshAccessToken(session.refresh_token)
        if (!result.success) {
            console.log('[db:getSession] failed to refresh access token: ', result.error)
            return null
        }
        updateSession.run(result.data.access_token, result.data.refresh_token, now + result.data.expires_in, session_id);
        session.access_token = result.data.access_token;
        session.refresh_token = result.data.refresh_token;
        session.expires_at = now + result.data.expires_in;
    }
    return session
};
