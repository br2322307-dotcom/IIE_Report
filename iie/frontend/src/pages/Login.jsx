import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ setUser }) {

  const [activeTab, setActiveTab] = useState('signin'); // 'signup' or 'signin'

  // Sign In State
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign Up State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [clientId, setClientId] = useState('');
  const [role, setRole] = useState('student');
  const [signupPassword, setSignupPassword] = useState('');
  
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: userId, password })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setUser(data.user);
        navigate(data.user.role === 'admin' ? '/admin/dashboard' : (data.user.role === 'worker' ? '/worker/dashboard' : '/student/dashboard'));
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Validate Indian mobile number (simple validation 10 digits)
    if (!/^\d{10}$/.test(mobile)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          client_id: clientId,
          role,
          first_name: firstName,
          last_name: lastName,
          email,
          mobile,
          password: signupPassword
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setShowPopup(true);
        // Clear form
        setFirstName(''); setLastName(''); setEmail(''); setMobile('');
        setClientId(''); setRole('student'); setSignupPassword('');
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // Restrict mobile input to numbers only
  const handleMobileChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      setMobile(val);
    }
  };

  return (
    <div className="login-page-container" style={{ background: '', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {showPopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(205, 15, 15, 0.01)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#18181b', padding: '30px', borderRadius: '16px', 
            border: '1px solid #3f3f46', textAlign: 'center', color: 'white', maxWidth: '400px'
          }}>
            <h3 style={{ marginBottom: '15px' }}>Account Under Process</h3>
            <p style={{ color: '#a1a1aa', marginBottom: '20px' }}>Your request has been sent to the admin. Please wait while they verify if you are an authentic student.</p>
            <button 
              onClick={() => { setShowPopup(false); setActiveTab('signin'); }}
              style={{ background: 'white', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '8px', cFfursor: 'pointer', fontWeight: 600 }}
            >
              Back to Login
            </button>
          </div>
        </div>
      )}

      <div className="login-wrapper" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="login-card" style={{ 
          background: 'rgba(24, 24, 27, 0.7)', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          borderRadius: '24px', 
          padding: '2.5rem',
          textAlign: 'left',
          backdropFilter: 'blur(20px)'
        }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: '30px', padding: '4px', marginBottom: '2rem', width: 'fit-content' }}>
         
            <button 
              onClick={() => { setActiveTab('signin'); setError(''); }}
              style={{ 
                background: activeTab === 'signin' ? '#27272a' : 'transparent', 
                color: activeTab === 'signin' ? 'white' : '#a1a1aa',
                border: 'none', padding: '8px 24px', borderRadius: '24px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s'
              }}
            >
              Sign in
            </button>

               <button 
              onClick={() => { setActiveTab('signup'); setError(''); }}
              style={{ 
                background: activeTab === 'signup' ? '#27272a' : 'transparent', 
                color: activeTab === 'signup' ? 'white' : '#a1a1aa',
                border: 'none', padding: '8px 24px', borderRadius: '24px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s'
              }}
            >
              Sign up
            </button>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem', color: 'white' }}>
            {activeTab === 'signup' ? 'Create an account' : 'Welcome back'}
          </h2>

          {error && <div style={{color: '#ef4444', marginBottom: '15px', fontSize: '0.9rem'}}>{error}</div>}

          {activeTab === 'signup' ? (
            <form onSubmit={handleSignup}>
              
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <input type="text" placeholder="First name" required value={firstName} onChange={e => setFirstName(e.target.value)} 
                    style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <input type="text" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} 
                    style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <input type="email" placeholder="Enter your email" required value={email} onChange={e => setEmail(e.target.value)} 
                  style={inputStyle} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <div style={{ 
                  display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0 15px',
                  color: 'white'
                }}>
                  🇮🇳 +91
                </div>
                <input type="text" placeholder="Mobile Number" required value={mobile} onChange={handleMobileChange} 
                  style={{...inputStyle, flex: 1}} />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <input type="text" placeholder="Client ID / Roll No" required value={clientId} onChange={e => setClientId(e.target.value)} 
                    style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}>
                    <option value="student" style={{color: 'black'}}>Student</option>
                    <option value="Faculty" style={{color: 'black'}}>Faculty</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <input type="password" placeholder="Create password" required value={signupPassword} onChange={e => setSignupPassword(e.target.value)} 
                  style={inputStyle} />
              </div>

              <button type="submit" disabled={isLoading} style={buttonStyle}>
                {isLoading ? 'Processing...' : 'Create an account'}
              </button>

              <p style={{ textAlign: 'center', color: '#71717a', fontSize: '0.8rem', marginTop: '20px' }}>
                By creating an account, you agree to our Terms & Service
              </p>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '8px' }}>User ID</label>
                <input type="text" placeholder="User ID" required value={userId} onChange={e => setUserId(e.target.value)} 
                  style={inputStyle} />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '8px' }}>Password</label>
                <input type="password" placeholder="Enter your password" required value={password} onChange={e => setPassword(e.target.value)} 
                  style={inputStyle} />
              </div>

              <button type="submit" disabled={isLoading} style={buttonStyle}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline styles to match the dark theme in the image closely
const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  color: 'white',
  outline: 'none',
  fontSize: '0.95rem'
};

const buttonStyle = {
  width: '100%',
  padding: '14px',
  background: 'white',
  color: 'black',
  border: 'none',
  borderRadius: '12px',
  fontWeight: 600,
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'transform 0.2s'
};
