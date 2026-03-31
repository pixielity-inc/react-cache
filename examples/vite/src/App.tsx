import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import ContainerPage from "@/pages/container";
import AdvancedPage from "@/pages/advanced";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<ContainerPage />} path="/container" />
      <Route element={<AdvancedPage />} path="/advanced" />
    </Routes>
  );
}

export default App;
