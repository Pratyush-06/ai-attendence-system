import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/teacher/login" element={<Login type="teacher" />} />
          <Route path="/teacher/register" element={<Register type="teacher" />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/analytics" element={<AnalyticsDashboard />} />

          <Route path="/student/login" element={<Login type="student" />} />
          <Route path="/student/register" element={<Register type="student" />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
