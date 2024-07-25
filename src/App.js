
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import {AdminLog} from './components/AdminLog';
import Login from './pages/Login';
import AdminHome from './pages/AdminHome';
import Test from './components/Test';
import {LoginForm} from './components/LoginForm';
import { ITSecLog } from './components/ITSecLog';
import LineHome from './pages/LineHome';
import Orderdetails from './components/Orderdetails';

function App() {
  return (
    <div className="App">
      <Router>
       <Routes>
       <Route path="/components/AdminLog" element={<AdminLog />} />
       <Route path="/components/ITSecLog" element={<ITSecLog />} />
       <Route path="/components/LoginForm" element={<LoginForm />} />
       <Route path="/pages/Login" element={<Login />} />
       <Route path="/pages/Home" element={<Home />} />
       <Route path="/pages/AdminHome" element={<AdminHome />} />
       <Route path="/pages/LineHome" element={<LineHome />} />
       <Route path="/components/Orderdetails" element={<Orderdetails />} />
       <Route path="/" element={<Home />} />
      </Routes>
    </Router>
    {/* <AdminLog/> */}
    
    </div>
  );
}

export default App;
