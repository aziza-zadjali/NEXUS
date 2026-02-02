import React, { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import DataCatalog from "@/pages/DataCatalog";
import DomainPort from "@/pages/DomainPort";
import DomainFleet from "@/pages/DomainFleet";
import DomainEPC from "@/pages/DomainEPC";
import Governance from "@/pages/Governance";
import DomainJourney from "@/pages/DomainJourney";
import DataContracts from "@/pages/DataContracts";
import PlatformCapabilities from "@/pages/PlatformCapabilities";
import DataProductCanvas from "@/pages/DataProductCanvas";
import { Toaster } from "@/components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthContext = React.createContext(null);

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/catalog" element={<ProtectedRoute><DataCatalog /></ProtectedRoute>} />
            <Route path="/domain/port" element={<ProtectedRoute><DomainPort /></ProtectedRoute>} />
            <Route path="/domain/fleet" element={<ProtectedRoute><DomainFleet /></ProtectedRoute>} />
            <Route path="/domain/epc" element={<ProtectedRoute><DomainEPC /></ProtectedRoute>} />
            <Route path="/governance" element={<ProtectedRoute><Governance /></ProtectedRoute>} />
            <Route path="/domain-journey" element={<ProtectedRoute><DomainJourney /></ProtectedRoute>} />
            <Route path="/contracts" element={<ProtectedRoute><DataContracts /></ProtectedRoute>} />
            <Route path="/platform" element={<ProtectedRoute><PlatformCapabilities /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </AuthContext.Provider>
  );
}

export default App;
