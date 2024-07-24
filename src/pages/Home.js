import React from 'react'
import Titlepic from '../components/Titlepic'
import { useNavigate } from 'react-router-dom';
import LoginButton from '../components/LoginButton';
import './pages.css'


export default function Home() {
    const navigate = useNavigate();

  const handleClick = () => navigate('/pages/AdminLogin');
  return (
    <div className='all'>
    <div className='back'>
        <Titlepic/>
        <LoginButton/>
        <button className='newuser' onClick={handleClick}>Admin Login</button>  
    </div>
    </div>
  )
}

