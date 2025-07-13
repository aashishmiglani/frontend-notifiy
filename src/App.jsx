import { BrowserRouter, Routes, Route } from "react-router-dom";
import SchedulePage from "./pages/SchedulePage.jsx";
import ContactSelectPage from "./pages/ContactSelectPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected Routes nested under PrivateRoute */}
        <Route element={<PrivateRoute />}>
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/contacts" element={<ContactSelectPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
