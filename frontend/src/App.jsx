import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import './index.css';

// Student Flow Components
import StudentLayout from './components/student/StudentLayout';
import StudentDashboard from './pages/student/Dashboard';
import MyReports from './pages/student/MyReports';
import Graphs from './pages/student/Graphs';
import Announcements from './pages/student/Announcements';
import Profile from './pages/student/Profile';

// Admin Flow Components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AgentWorkers from './pages/admin/AgentWorkers';
import Workers from './pages/admin/Workers';
import Users from './pages/admin/Users';
import Reports from './pages/admin/Reports';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminPlaceholder from './pages/admin/Placeholder';
import WorkerDashboard from './pages/worker/WorkerDashboard';

// This is the main Application component. It wraps everything.
function App() {
 
  // 'user' state holds the currently logged-in user's data (like their name and role).
  // If it's null, it means nobody is logged in.
  const [user, setUser] = useState(null);
  
  // 'loading' state is used to show a blank/loading screen while we ask the backend if the user is already logged in.
  const [loading, setLoading] = useState(true);

  // useEffect runs once when the app first loads.
  useEffect(() => {
    // We send a request to our Flask backend to check if there is an active session cookie.
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        // If the backend says we are authenticated, we save the user data in our state!
        if (data.authenticated) {
          setUser(data);
        }
      })
      // Finally block runs after the fetch is done, whether it succeeded or failed.
      // We turn off the loading screen so the app can render.
      .finally(() => setLoading(false));
  }, []); // The empty array [] means "only run this effect ONCE when the app starts".

  // If we are still waiting for the backend to reply, just show a loading text.
  // This prevents the app from flashing the Login screen for a split second if the user is already logged in.
  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>Loading...</div>;

  const userRole = user?.role?.toLowerCase();
  const isStudent = userRole === 'student' || userRole === 'faculty';
  const isAdmin = userRole === 'admin';
  const isWorker = userRole === 'worker';

  return (
    // BrowserRouter enables client-side routing. This makes navigation smooth and fast 
    // without ever reloading the browser page!
    <BrowserRouter>
      {/* Routes is a container that decides which component to show based on the current URL */}
      <Routes>
        
        {/* Route for the Home page ("/") */}
        <Route path="/" element={<Home />} />
        
        {/* Route for the Login page ("/login") */}
        {/* If the user is NOT logged in (!user), show the Login component. */}
        {/* If they ARE logged in, use <Navigate> to instantly redirect them to their dashboard based on their role. */}
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to={isAdmin ? '/admin/dashboard' : (isWorker ? '/worker/dashboard' : '/student/dashboard')} />} />
        
        {/* Route for the Student Flow (Layout + Pages) */}
        {/* Security check: Only show this if the user exists AND their role is student or faculty. */}
        <Route path="/student" element={isStudent ? <StudentLayout user={user} setUser={setUser} /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard user={user} />} />
          <Route path="reports" element={<MyReports user={user} />} />
          <Route path="graphs" element={<Graphs user={user} />} />
          <Route path="announcements" element={<Announcements user={user} />} />
          <Route path="profile" element={<Profile user={user} />} />
        </Route>
        
        {/* Route for the Admin Flow (Layout + Pages) */}
        {/* Security check: Only show this if the user exists AND their role is 'admin'. */}
        <Route path="/admin" element={isAdmin ? <AdminLayout user={user} setUser={setUser} /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard user={user} />} />
          <Route path="assign" element={<AgentWorkers />} />
          <Route path="workers" element={<Workers />} />
          <Route path="users" element={<Users />} />
          <Route path="reports" element={<Reports />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="settings" element={<AdminPlaceholder />} />
        </Route>
        

        {/* Route for the Worker Flow */}
        <Route path="/worker" element={isWorker ? <WorkerDashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/worker/dashboard" element={isWorker ? <WorkerDashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
  
}

export default App;
