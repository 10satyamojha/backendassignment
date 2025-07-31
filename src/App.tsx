// App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailVerification from "./pages/EmailVerification";
import Howtouse from "./pages/howtousepage.jsx"
import Forgotpassword from "./pages/forgotpassword.jsx"
// import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import "./App.css";

const App = () => {
  return (
   
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
         <Route path="/forgot-password" element={<Forgotpassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            {/* <Dashboard /> */}
            {<Howtouse/>}
          </PrivateRoute>
        } />
      </Routes>
   
  );
};

export default App;