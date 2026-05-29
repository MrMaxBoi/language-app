import { Box, useColorModeValue } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";

import SessionPage from "./pages/SessionPage";
import DashboardPage from "./pages/DashboardPage";
import Navbar from "./components/Navbar";
import ReportPage from "./pages/ReportPage";

function App() {
  return (
    <Box minH= {"100vh"} bg={useColorModeValue("gray.100", "gray.900")} >
      <Navbar/>
      <Routes>
        <Route path='/' element={<SessionPage />} />
        <Route path='/session' element={<SessionPage />} />
        <Route path='/report' element={<ReportPage />} />
        <Route path='/dashboard' element={<DashboardPage />} />
      </Routes>
    </Box>
  );
};

export default App
