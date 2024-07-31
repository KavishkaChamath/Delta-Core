import Titlepic from "../components/Titlepic";
import React from 'react'
import { useNavigate } from 'react-router-dom';
import SignOut from "../components/SignOut";
import './pages.css'

export default function ItHome(){

    const navigate = useNavigate();
    const handleClick = () => navigate('/pages/EmployeeHome');
    const handleClick1 = () => navigate('/pages/OrderHome');

    return(
        <div>
            <Titlepic/>
            <SignOut/>
            <div className="Ithome">
            <button className="empbutton" onClick={handleClick}>Employee Detalis</button>
            <button className="orderbutton" onClick={handleClick1}>Order Detalis</button>
            </div>
        </div>
    )
}