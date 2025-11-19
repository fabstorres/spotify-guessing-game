import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home";
import Join from "./pages/Join";

import "./index.css";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<Join />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
