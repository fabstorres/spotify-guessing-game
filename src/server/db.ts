import { Database } from "bun:sqlite";

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

const selectSession = db
    .query(
        `SELECT session_id, access_token, refresh_token, expires_at, created_at
     FROM users_sessions WHERE session_id = ?`
    )
    .as(UserSession);

export const createSession = (session_id: string, access_token: string, refresh_token: string, expires_in: number) => {
    insertSession.run(session_id, access_token, refresh_token, Math.floor(new Date().getTime() / 1000) + expires_in, Math.floor(new Date().getTime() / 1000));
};

export const getSession = (session_id: string) => {
    return selectSession.get(session_id);
};
