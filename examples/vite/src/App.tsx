import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const IndexPage = lazy(() => import('@/pages/index'));
const ConfigPage = lazy(() => import('@/pages/config'));
const AdvancedPage = lazy(() => import('@/pages/advanced'));

function App() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}
    >
      <Routes>
        <Route element={<IndexPage />} path="/" />
        <Route element={<ConfigPage />} path="/config" />
        <Route element={<AdvancedPage />} path="/advanced" />
      </Routes>
    </Suspense>
  );
}

export default App;
