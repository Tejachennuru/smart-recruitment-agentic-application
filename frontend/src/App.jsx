import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import InterviewPage from './components/InterviewPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/interview/:token" element={<InterviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}