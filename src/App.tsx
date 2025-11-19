import "./index.css";
export function App() {
  return (
    <main className="flex flex-col gap-4 items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Spotify Guessing Game</h1>
        <p className="text-2xl">Guess which friend has this on their playlist</p>
      </div>

      <a className="bg-[#1ED760] hover:bg-[#1ED760]/80 hover:cursor-pointer text-white font-bold py-2 px-4 rounded" href="/spotify/login">
        Login with Spotify
      </a>
    </main>
  );
}

export default App;
