import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Demo from "./pages/Demo";
import DocsAdvanced from "./pages/DocsAdvanced";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/docs/*" element={<DocsAdvanced />} />
      </Routes>
    </Router>
  );
}

export default App;
