import React, {useState} from 'react';
import './EmployeeForm.css'; 
//import deltaapperal2 from './path/to/deltaapperal2.jpg'; // Ensure you have the correct path to your image
import { database } from '../Firebase';
import { ref, push } from 'firebase/database';
import ShowData from './ShowData';

export const EmployeeForm = () => {

  const [employeeNumber, setEmployeeNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [callingName, setCallingName] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [dateJoined, setDateJoined] = useState('');
  const [gender, setGender] = useState('');
  const [designation, setDesignation] = useState('');
  const [direct, setDirect] = useState(false);
  const [indirect, setIndirect] = useState(false);
  const [lineAllocation, setLineAllocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const employeeRef = ref(database, 'employees');
    const newEmployee = {
      employeeNumber,
      fullName,
      callingName,
      homeAddress,
      contactNumber,
      dateJoined,
      gender,
      designation,
      direct,
      indirect,
      lineAllocation
    };
    push(employeeRef, newEmployee)
    .then(() => {
      console.log('Data added successfully');
      // Optionally, reset the form
      setEmployeeNumber('');
      setFullName('');
      setCallingName('');
      setHomeAddress('');
      setContactNumber('');
      setDateJoined('');
      setGender('');
      setDesignation('');
      setDirect(false);
      setIndirect(false);
      setLineAllocation('');
    })
    .catch((error) => {
      console.error('Error adding data: ', error);
    });
  };
  return (
    <div>
      {/* Header with photo and gradient background */}
      <header className="header">
        {/* <img src={deltaapperal2} alt="Logo" className="header-logo" /> */}
        <div className="header-content">
          <h1>Employee Management</h1>
        </div>
      </header>

      {/* Employee Form */}
      <div className='form-wrapper'>
      <div className="transparent-box">
        <h2>Add Employee</h2>
        <form className='employee-form' onSubmit={handleSubmit}>
          <div className='form-group'>
            <label>Employee Number</label>
            <input type='text' placeholder='Employee Number' value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)} required />
          </div>
          <div className='form-group'>
            <label>Employee Full Name</label>
            <input type='text' placeholder='Employee Full Name' value={fullName}
                onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className='form-group'>
            <label>Calling Name</label>
            <input type='text' placeholder='Calling Name' value={callingName}
                onChange={(e) => setCallingName(e.target.value)} required />
          </div>
          <div className='form-group'>
            <label>Home Address</label>
            <input type='text' placeholder='Home Address' value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)} required />
          </div>
          <div className='form-group'>
            <label>Contact Number</label>
            <input type='text' placeholder='Contact Number' value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)} required />
          </div>
          <div className='form-group'>
            <label>Date of Joined</label>
            <input type='date' placeholder='Date of Joined' value={dateJoined}
                onChange={(e) => setDateJoined(e.target.value)} required />
          </div>
          
          <div className='form-group'>
            <label>Gender</label>
            <div className='radio-group'>
              <input type='radio' id='male' name='gender' value='male' checked={gender === 'male'} onChange={(e) => setGender(e.target.value)} />
              <label htmlFor='male'>Male</label>
              <input type='radio' id='female' name='gender' value='female' checked={gender === 'female'} onChange={() => setGender('female')} />
              <label htmlFor='female'>Female</label>
            </div>
          </div>
          <div className='form-group'>
            <label>Designation</label>
            <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
              >
                <option value=''>Select Designation</option>
                <option value='Manager'>Manager</option>
              {/* Add options as needed */}
            </select>
          </div>
          <div className='form-group'>
            <label>Direct/ Indirect</label>
            <div className='checkbox-group'>
              <input type='checkbox' id='direct' name='direct' checked={direct} onChange={() => setDirect(!direct)}/>
              <label htmlFor='direct'>Direct</label>
              <input type='checkbox' id='indirect' name='indirect' checked={indirect} onChange={() => setIndirect(!indirect)}/>
              <label htmlFor='indirect'>Indirect</label>
            </div>
          </div>
          <div className='form-group'>
            <label>Employee Line Allocation</label>
            <select
                value={lineAllocation}
                onChange={(e) => setLineAllocation(e.target.value)}
                required
              >
                <option value='' disabled>Select a line</option>
                <option value='Line 1'>Line 1</option>
                <option value='Line 2'>Line 2</option>
                <option value='Line 3'>Line 3</option>
                <option value='Line 4'>Line 4</option>
                <option value='Line 5'>Line 5</option>
                <option value='Line 6'>Line 6</option>
              {/* Add options as needed */}
            </select>
          </div>
          <button type='submit'>Add</button>
        </form>
      </div>
      </div>
      <ShowData/>
    </div>
  );
};

export default EmployeeForm;









  