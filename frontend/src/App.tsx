import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { VideoPage } from "./pages/VideoPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/videos/:videoId" element={<VideoPage />} />
    </Routes>
  );
}

export default App;
