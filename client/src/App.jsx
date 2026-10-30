import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateMysteryPage from './pages/CreateMysteryPage';
import InvestigationPage from './pages/InvestigationPage';
import ResultPage from './pages/ResultPage';
import CaseHistoryPage from './pages/CaseHistoryPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateMysteryPage />} />
        <Route path="/investigate/:id" element={<InvestigationPage />} />
        <Route path="/result/:id" element={<ResultPage />} />
        <Route path="/history" element={<CaseHistoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
