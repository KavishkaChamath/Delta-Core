import React, { useState, useEffect } from 'react';
import { database } from '../Firebase';
import { ref, onValue } from 'firebase/database';
import Titlepic from './Titlepic';
import SignOut from './SignOut';

// const EmployeeTable = () => {
//   const [employees, setEmployees] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filteredEmployee, setFilteredEmployee] = useState(null);

//   useEffect(() => {
//     const employeeRef = ref(database, 'employees');
//     onValue(employeeRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const employeeList = Object.keys(data).map((key) => ({
//           id: key,
//           ...data[key],
//         }));
//         setEmployees(employeeList);
//       }
//     });
//   }, []);

//   const handleSearch = () => {
//     const employee = employees.find(emp => emp.employeeNumber === searchTerm);
//     setFilteredEmployee(employee || null);
//   };

//   return (
//     <div>
//       <h2>Employee List</h2>
//       <div>
//         <input
//           type="text"
//           placeholder="Search by Employee Number"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <button onClick={handleSearch}>Search</button>
//       </div>
//       {filteredEmployee ? (
//         <table border="1">
//           <thead>
//             <tr>
//               <th>Employee Number</th>
//               <th>Full Name</th>
//               <th>Calling Name</th>
//               <th>Home Address</th>
//               <th>Contact Number</th>
//               <th>Date Joined</th>
//               <th>Gender</th>
//               <th>Designation</th>
//               <th>Direct</th>
//               <th>Indirect</th>
//               <th>Line Allocation</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               <td>{filteredEmployee.employeeNumber}</td>
//               <td>{filteredEmployee.fullName}</td>
//               <td>{filteredEmployee.callingName}</td>
//               <td>{filteredEmployee.homeAddress}</td>
//               <td>{filteredEmployee.contactNumber}</td>
//               <td>{filteredEmployee.dateJoined}</td>
//               <td>{filteredEmployee.gender}</td>
//               <td>{filteredEmployee.designation}</td>
//               <td>{filteredEmployee.direct ? 'Yes' : 'No'}</td>
//               <td>{filteredEmployee.indirect ? 'Yes' : 'No'}</td>
//               <td>{filteredEmployee.lineAllocation}</td>
//             </tr>
//           </tbody>
//         </table>
//       ) : (
//         <p>No employee data available</p>
//       )}
//     </div>
//   );
// };

// export default EmployeeTable;

// import React, { useState, useEffect } from 'react';
// import { ref, onValue } from 'firebase/database';
// import { database } from './firebase'; // Adjust the import path as necessary

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  useEffect(() => {
    const employeeRef = ref(database, 'employees');
    onValue(employeeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const employeeList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setEmployees(employeeList);
        setFilteredEmployees(employeeList); // Initially display all employees
      }
    });
  }, []);

  const handleSearch = () => {
    const filtered = employees.filter(emp =>
      emp.employeeNumber.includes(searchTerm) || emp.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  };

  return (
    <div>
      <Titlepic/>
      <SignOut/>
      <h2>Employee List</h2>
      <div>
        <input
          type="text"
          placeholder="Search by Employee Number or Full Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {filteredEmployees.length > 0 ? (
        <table border="1">
          <thead>
            <tr>
              <th>Employee Number</th>
              <th>Full Name</th>
              <th>Calling Name</th>
              <th>Home Address</th>
              <th>Contact Number</th>
              <th>Date Joined</th>
              <th>Gender</th>
              <th>Designation</th>
              <th>Direct</th>
              <th>Indirect</th>
              <th>Line Allocation</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.employeeNumber}</td>
                <td>{employee.fullName}</td>
                <td>{employee.callingName}</td>
                <td>{employee.homeAddress}</td>
                <td>{employee.contactNumber}</td>
                <td>{employee.dateJoined}</td>
                <td>{employee.gender}</td>
                <td>{employee.designation}</td>
                <td>{employee.direct ? 'Yes' : 'No'}</td>
                <td>{employee.indirect ? 'Yes' : 'No'}</td>
                <td>{employee.lineAllocation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No employee data available</p>
      )}
    </div>
  );
};

export default EmployeeTable;
