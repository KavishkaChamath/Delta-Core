import React,{useContext} from 'react'
import Titlepic from "../components/Titlepic";
import { useNavigate } from 'react-router-dom';
import SignOut from "../components/SignOut";
import './pages.css'
import '../components/Cuttingdetails.css'
import { Helmet } from 'react-helmet';
import { UserContext } from '../components/UserDetails';
import welcome from '../components/Images/img101.png';


export default function CutHome() {
    const navigate = useNavigate();
    const handleClick = () => navigate('/comp/cutting');
    const handleClick1 = () => navigate('/comp/bundle');
    const handleClick2 = () => navigate('/comp/inqueue');

    const { user } = useContext(UserContext);

  return (
    <div className='holder'>
      <Helmet>
        <title>Cut Home</title>
      </Helmet>
        <Titlepic/>
        <SignOut/>

        <div className='cutButtons'>
        <button onClick={handleClick}>Cut Detalis</button>
        <button onClick={handleClick1}>Bundle Allocation</button>
        <button onClick={handleClick2}>Inqueue</button>
        </div>
    </div>
  )
}
