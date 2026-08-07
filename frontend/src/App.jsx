import { Box, useColorModeValue } from "@chakra-ui/react";
import { Navigate, Route, Routes } from "react-router-dom";

import SessionPage from "./pages/SessionPage";
import AdaptiveEngineDashboard from "./pages/AdaptiveEngineDashboard";
import HomePage from "./pages/HomePage";
import InsightsPage from "./pages/InsightsPage";
import Navbar from "./components/Navbar";
import ReportPage from "./pages/ReportPage";
import ResultPage from "./pages/ResultPage";
import ReviewPage from "./pages/ReviewPage";
import RoadmapPage from "./pages/RoadmapPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <Box minH= {"100vh"} bg={useColorModeValue("gray.100", "gray.900")} >
      <Navbar/>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/roadmap' element={<RoadmapPage />} />
        <Route path='/session' element={<SessionPage />} />
        <Route path='/result' element={<ResultPage />} />
        <Route path='/review' element={<ReviewPage />} />
        <Route path='/insights' element={<InsightsPage />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/report' element={<ReportPage />} />
        <Route path='/dashboard' element={<Navigate to="/" replace />} />
        <Route path='/engine' element={<AdaptiveEngineDashboard />} />
      </Routes>
    </Box>
  );
};

export default App
