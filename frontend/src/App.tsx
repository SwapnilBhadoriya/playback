import { Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "./pages/HomePage";
import { VideoPage } from "./pages/VideoPage";

function App() {
  return (
    <TooltipProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/videos/:videoId" element={<VideoPage />} />
        </Route>
      </Routes>
    </TooltipProvider>
  );
}

export default App;
