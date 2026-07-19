import { Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "./pages/HomePage";
import { VideoPage } from "./pages/VideoPage";
import { VideosLibraryPage } from "./pages/VideosLibraryPage";

function App() {
  return (
    <TooltipProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/videos" element={<VideosLibraryPage />} />
          <Route path="/videos/:videoId" element={<VideoPage />} />
        </Route>
      </Routes>
    </TooltipProvider>
  );
}

export default App;
