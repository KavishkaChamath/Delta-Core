import React from "react";
import ShowData from '../components/ShowData';
import { useNavigate } from 'react-router-dom';
import SignOut from "../components/SignOut";

export default function EmployeeHome(){

    const navigate = useNavigate();
    const handleClick = () => navigate('/pages/AddEmployee');
    

    return(
        <div className="holder">
        <div>
            <SignOut/>
            <ShowData/>
            <button className="" onClick={handleClick}>Add Employee</button>
        </div>
        </div>
    )
}