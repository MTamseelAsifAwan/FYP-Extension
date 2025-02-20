import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import SignupForm from './Ladingpagecomponents/Signupform.jsx';
import LoginForm from './Ladingpagecomponents/Loginform.jsx';
import App from './Ladingpagecomponents/App.jsx';
import Dashboard from './DashboardComponents/Dashboard.jsx';

const Routers = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/" element={<App />} />
        <Route path="*" element={<Navigate to="/" />} /> {/* Catch-all route */}
      </Routes>
    </Suspense>
  );
};

export default Routers;
