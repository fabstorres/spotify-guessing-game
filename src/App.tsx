import { BrowserRouter, Route, Routes } from "react-router";
import { WebSocketProvider } from "./providers/WebSocketProvider";
import Home from "./pages/Home";
import Join from "./pages/Join";

import "./index.css";

export function App() {
  return (
    <BrowserRouter>
      <WebSocketProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/join" element={<Join />} />
        </Routes>
      </WebSocketProvider>
    </BrowserRouter>
  );
}

export default App;
