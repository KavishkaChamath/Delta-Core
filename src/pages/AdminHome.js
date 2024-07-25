import React from 'react'
import Titlepic from '../components/Titlepic'
import SignOut from '../components/SignOut'
import EmployeeForm from '../components/EmployeeForm';
import AddNewUser from '../components/AddNewUser';
import Signup from '../components/Signup';
import Orderdetails from '../components/Orderdetails';
import ShowOder from '../components/ShowOder';

export default function AdminHome() {
  return (
    <div>
        <Titlepic/>
        <SignOut/>
        <EmployeeForm/>
        <Orderdetails/>
        <ShowOder/>
        <Signup/>
        

    </div>
  )
}
