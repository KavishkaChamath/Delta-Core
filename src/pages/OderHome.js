import React from "react";
import { useNavigate } from 'react-router-dom';
import ShowOrder from "../components/ShowOder";

export default function EmployeeHome(){

    const navigate = useNavigate();
    const handleClick = () => navigate('/components/Orderdetails');

    return(
        <div>
            
            <ShowOrder/>
            <button className="" onClick={handleClick}>Add Order</button>
        </div>
    )
}