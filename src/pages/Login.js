import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Titlepic from '../components/Titlepic';
import './pages.css';

export default function Login() {
  const navigate = useNavigate();
  const handleClick = () => navigate('/components/AdminLog');
  const handleClick1= () => navigate('/components/ITSecLog');
  const handleClick2= () => navigate('/components/LoginForm');
  return (
    <div className='holder'>
        <Titlepic/>
           <center>
        <nav>
          <div className='container'>
          <div className='n1'>
            <Link className='l1' to="/components/AdminLog" onClick={() => handleClick()}>
            
             Admin
             
            </Link>
          </div>
          <div className='n2'> 
            <Link className='l1' to="/components/ITSecLog" onClick={() => handleClick1()}>
            
              IT Section
              
            </Link>
          </div>
          <div className='n3'>
            <Link className='l1' to="/components/LoginForm" onClick={() => handleClick2()}>
            
              Line Manager 
              
            </Link>
          </div>
          </div>
        </nav>
      </center>
      <div className="footer">
        <p>&copy; 2024 Delta Apparels</p>
      </div>
    </div>
  )
}
