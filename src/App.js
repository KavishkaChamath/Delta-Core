
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import Login from './pages/Login';
import AdminHome from './pages/AdminHome';
import Test from './components/Test';
import {LineLoginForm} from './components/LineLoginForm';

function App() {
  return (
    <div className="App">
      <Router>
       <Routes>
       <Route path="/pages/AdminLogin" element={<AdminLogin />} />
       <Route path="/components/LineLoginForm" element={<LineLoginForm />} />
       <Route path="/pages/Login" element={<Login />} />
       <Route path="/pages/AdminHome" element={<AdminHome />} />
       <Route path="/" element={<Home />} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
