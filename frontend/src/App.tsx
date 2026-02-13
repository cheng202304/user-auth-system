import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ProfileProvider } from './pages/ProfilePage';
import { ProfilePage } from './components/ProfilePage';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>User Authentication System</h1>
          <nav>
            <Link to="/profile">Profile</Link>
          </nav>
        </header>
        <main>
          <ProfileProvider>
            <Routes>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/" element={
                <div>
                  <p>Welcome to the User Authentication System</p>
                  <p>Navigate to <Link to="/profile">Profile</Link> to manage your account</p>
                </div>
              } />
            </Routes>
          </ProfileProvider>
        </main>
      </div>
    </Router>
  );
}

export default App;
