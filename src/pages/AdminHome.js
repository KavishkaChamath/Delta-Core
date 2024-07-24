import React from 'react'
import Titlepic from '../components/Titlepic'
import SignOut from '../components/SignOut'
import EmployeeForm from '../components/EmployeeForm';

export default function AdminHome() {
  return (
    <div>
        <Titlepic/>
        <SignOut/>
        <EmployeeForm/>

    </div>
  )
}
