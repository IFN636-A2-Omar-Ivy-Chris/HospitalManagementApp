import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import WardsPage from "./pages/WardsPage";
import WardPatientsPage from "./pages/WardPatientsPage";
import PatientAdmissionPage from "./pages/PatientAdmissionPage";
import PatientRecordPage from "./pages/PatientRecordPage";
import PatientEditPage from "./pages/PatientEditPage";

import "./App.css";

function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />

                <Route
                    path="/home"
                    element={
                        <ProtectedRoute>
                            <HomePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/wards"
                    element={
                        <ProtectedRoute>
                            <WardsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/wards/:wardId"
                    element={
                        <ProtectedRoute>
                            <WardPatientsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/wards/:wardId/admit"
                    element={
                        <ProtectedRoute>
                            <PatientAdmissionPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patients/:patientId"
                    element={
                        <ProtectedRoute>
                            <PatientRecordPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patients/:patientId/edit"
                    element={
                        <ProtectedRoute>
                            <PatientEditPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
