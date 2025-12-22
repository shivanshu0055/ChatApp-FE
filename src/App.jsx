import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Signup from './Pages/Signup';
import Signin from './Pages/Signin';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import LandingPage from './pages/LandingPage';
import { ToastContainer } from "react-toastify";
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/chat/:chatID" element={<ChatPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
        <ToastContainer position="top-right" autoClose={2000} />
    </Router>
  );
}

export default App;
