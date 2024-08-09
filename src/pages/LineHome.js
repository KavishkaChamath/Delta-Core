import React from 'react'
import SignOut from '../components/SignOut'
import Titlepic from '../components/Titlepic'
import LineButtons from '../components/LineButtons'
import Cutting from '../components/Cutting'

export default function LineHome() {
  return (
    <div>
      <Titlepic/>
        <SignOut/>
        
        {/* Line Manager Home
        <LineButtons/> */}
        <Cutting/>

    </div>
  )
}
