import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Participant Pages
import ParticipantDashboard from './pages/participant/ParticipantDashboard';
import AvailableSurveys from './pages/participant/AvailableSurveys';
import TakeSurvey from './pages/participant/TakeSurvey';
import AvailablePolls from './pages/participant/AvailablePolls';
import VotePoll from './pages/participant/VotePoll';
import ViewSurveyResult from './pages/participant/ViewSurveyResult';
import MyHistory from './pages/participant/MyHistory';
import Profile from './pages/participant/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageSurveys from './pages/admin/ManageSurveys';
import CreateEditSurvey from './pages/admin/CreateEditSurvey';
import ManageQuestions from './pages/admin/ManageQuestions';
import ManagePolls from './pages/admin/ManagePolls';
import CreateEditPoll from './pages/admin/CreateEditPoll';
import ViewSurveyResponses from './pages/admin/ViewSurveyResponses';
import AdminSurveyResults from './pages/admin/AdminSurveyResults';
import AdminPollResults from './pages/admin/AdminPollResults';
import ManageUsers from './pages/admin/ManageUsers';

// Home Redirect Helper
const HomeRedirect = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return isAdmin ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Landing Route */}
              <Route path="/" element={<Home />} />

              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Participant Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <ParticipantDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/surveys"
                element={
                  <ProtectedRoute>
                    <AvailableSurveys />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/surveys/:id"
                element={
                  <ProtectedRoute>
                    <TakeSurvey />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/surveys/:id/results"
                element={
                  <ProtectedRoute>
                    <ViewSurveyResult />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/polls"
                element={
                  <ProtectedRoute>
                    <AvailablePolls />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/polls/:id"
                element={
                  <ProtectedRoute>
                    <VotePoll />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <MyHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/surveys"
                element={
                  <ProtectedRoute adminOnly>
                    <ManageSurveys />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/surveys/create"
                element={
                  <ProtectedRoute adminOnly>
                    <CreateEditSurvey />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/surveys/:id/edit"
                element={
                  <ProtectedRoute adminOnly>
                    <CreateEditSurvey />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/surveys/:id/questions"
                element={
                  <ProtectedRoute adminOnly>
                    <ManageQuestions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/surveys/:id/responses"
                element={
                  <ProtectedRoute adminOnly>
                    <ViewSurveyResponses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/surveys/:id/analytics"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminSurveyResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/polls"
                element={
                  <ProtectedRoute adminOnly>
                    <ManagePolls />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/polls/create"
                element={
                  <ProtectedRoute adminOnly>
                    <CreateEditPoll />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/polls/:id/edit"
                element={
                  <ProtectedRoute adminOnly>
                    <CreateEditPoll />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/polls/:id/analytics"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminPollResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute adminOnly>
                    <ManageUsers />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Catch-all Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
