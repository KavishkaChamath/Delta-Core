import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Titlepic from '../components/Titlepic';
import './pages.css';

export default function Login() {
  const navigate = useNavigate();
  const handleClick = () => navigate('/pages/AdminLogin');
  return (
    <div className='holder'>
        <Titlepic/>
           <center>
        <nav>
          <div className='container'>
          <div className='n1'>
            <Link className='l1' to="/pages/AdminLogin" onClick={() => handleClick()}>
            
             Admin
             
            </Link>
          </div>
          <div className='n1'> 
            <Link className='l1' to="/pages/AdminLogin" onClick={() => handleClick()}>
            
              It Section
              
            </Link>
          </div>
          <div className='n1'>
            <Link className='l1' to="/pages/AdminLogin" onClick={() => handleClick()}>
            
              Line Manager 
              
            </Link>
          </div>
          </div>
        </nav>
      </center>
    </div>
  )
}
