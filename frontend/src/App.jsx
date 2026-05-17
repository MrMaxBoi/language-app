import { Box, useColorModeValue } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";

import CreatePage from "./pages/CreatePage";
import HomePage from "./pages/HomePage";
import SessionPage from "./pages/SessionPage";
import Navbar from "./components/Navbar";
import ReportPage from "./pages/ReportPage";

function App() {
  return (
    <Box minH= {"100vh"} bg={useColorModeValue("gray.100", "gray.900")} >
      <Navbar/>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/create' element={<CreatePage />} />
        <Route path='/session' element={<SessionPage />} />
        <Route path='/report' element={<ReportPage />} />
      </Routes>
    </Box>
  );
};

export default App
