import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, ReactNode } from "react";
import { LoginTest } from './service/Login';
import { Container } from "./components/Container";
import { Sidebar } from "./components/Sidebar";
import { Home } from "./service/Home";
import { Humidity } from "./service/Humidity";
import { Light } from "./service/Light"; // Component này giờ đây đã có logic polling bên trong nó
import { Clock } from "./service/Clock";
import { Settings } from "./service/Settings";
import { Devices } from "./service/Devices"; // Import the Devices component
import { Buttons } from "./service/Buttons"; // Import the Buttons component

// Protected route component
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is authenticated when app loads
    const checkAuth = () => {
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="bg-gray-200 h-screen flex items-center justify-center">
            <LoginTest />
          </div>
        } />
        <Route path="/home" element={
          <ProtectedRoute>
            <div>
              <div>
                <Container />
              </div>
              <div className="absolute top-0 left-0 w-full h-full">
                <Sidebar />
              </div>
              <div className="absolute top-[70px] left-[100px] right-0 bottom-0">
                <Home />
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/humidity" element={
          <ProtectedRoute>
            <div>
              <div>
                <Container />
              </div>
              <div className="absolute top-0 left-0 w-full h-full">
                <Sidebar />
              </div>
              <div className="absolute top-[80px] left-[100px] right-2 bottom-0 bg-indigo-50">
                <Humidity />
              </div>
            </div>
          </ProtectedRoute>
        } />
        {/* Đoạn quan trọng cho phần Đèn (Light) */}
        <Route path="/light" element={
          <ProtectedRoute>
            <div>
              <div>
                <Container />
              </div>
              <div className="absolute top-0 left-0 w-full h-full">
                <Sidebar />
              </div>
              <div className="absolute top-[80px] left-[100px] right-2 bottom-0 bg-indigo-50">
                {/* Khi người dùng truy cập /light, component <Light /> sẽ được render.
                  Nếu bạn đã cập nhật <Light /> để nó tự polling dữ liệu,
                  thì logic polling sẽ hoạt động ngay khi component này được hiển thị.
                */}
                <Light />
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/devices" element={
          <ProtectedRoute>
            <div>
              <div>
                <Container />
              </div>
              <div className="absolute top-0 left-0 w-full h-full">
                <Sidebar />
              </div>
              <div className="absolute top-[80px] left-[100px] right-2 bottom-0 bg-indigo-50">
                <Devices />
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        {/* Buttons route */}
        <Route path="/buttons" element={
          <ProtectedRoute>
            <div>
              <div>
                <Container />
              </div>
              <div className="absolute top-0 left-0 w-full h-full">
                <Sidebar />
              </div>
              <div className="absolute top-[80px] left-[100px] right-2 bottom-0 bg-indigo-50">
                <Buttons />
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        {/* We no longer need the individual device route since details are shown in the Devices component */}
        <Route path="/clock" element={
          <ProtectedRoute>
            <div>
              <div>
                <Container />
              </div>
              <div className="absolute top-0 left-0 w-full h-full">
                <Sidebar />
              </div>
              <div className="absolute top-[80px] left-[100px] right-2 bottom-0 bg-indigo-50">
                <Clock />
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/setting" element={
          <ProtectedRoute>
            <div>
              <div>
                <Container />
              </div>
              <div className="absolute top-0 left-0 w-full h-full">
                <Sidebar />
              </div>
              <div className="absolute top-[80px] left-[100px] right-2 bottom-0 bg-indigo-50">
                <Settings />
              </div>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;