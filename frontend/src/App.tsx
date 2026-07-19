import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "./pages/HomePage";
import { VideoPage } from "./pages/VideoPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/videos/:videoId" element={<VideoPage />} />
      </Route>
    </Routes>
  );
}

export default App;
