import React, { useState,useEffect } from 'react';
import './Admin.css';
import { useNavigate } from 'react-router-dom';
import SignOut from '../components/SignOut';
import Titlepic from '../components/Titlepic';
import { database } from '../Firebase'; // Adjust the import path as needed
import { ref, get, set,remove, onValue, serverTimestamp, push } from 'firebase/database';




function App() {
  const navigate = useNavigate();

  const currentDate = new Date().toISOString().split('T')[0]; // Format current date as YYYY-MM-DD

  const [lines, setLines] = useState([
    { id: 1, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 2, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 3, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 4, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 5, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 6, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 7, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 8, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 9, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 10, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 11, efficiency: "0%", incentive: "0/=", quality: "0" },
    { id: 12, efficiency: "0%", incentive: "0/=", quality: "0" },
  ]);
  

  // Firebase reference to dailyUpdates for the current date
  const dailyUpdatesRef = ref(database, `dailyUpdates/${currentDate}`);
  
  const pageChanger = (path) => navigate(path);


  useEffect(() => {
    const unsubscribe = onValue(dailyUpdatesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        const updatedLines = lines.map((line) => {
          const lineData = data[`Line ${line.id}`]; // Accessing data for each line
          
          if (lineData?.Effiency) {
            // Sum up all the Quality values inside Effiency entries
            const totalQuality = Object.values(lineData.Effiency).reduce((sum, effEntry) => {
              return sum + (effEntry.Quality || 0); // Add each Quality, defaulting to 0 if not present
            }, 0);
  
            return {
              ...line,
              efficiency: lineData?.CurrentEffiency ? `${lineData.CurrentEffiency.toFixed(2)}%` : "0%",
              quality: totalQuality, // Set the total sum of Quality
            };
          } else {
            // If no efficiency data, set default values
            return {
              ...line,
              efficiency: lineData?.CurrentEffiency ? `${lineData.CurrentEffiency.toFixed(2)}%` : "0%",
              quality: lineData?.total1stQuality || "0",
            };
          }
        });
        
        setLines(updatedLines);
      }
    });
  
    return () => unsubscribe(); // Cleanup listener on unmount
  }, [currentDate]);
  

  return (
    
    <div className="App">
      <Titlepic />
      <SignOut />
      <header className="App-header">
        <h1>Admin Home</h1>
      </header>
      <div className="sidebar">
        <button className="sidebar-button" onClick={() => pageChanger('/pages/EmployeeHome')}>Employee Details</button>
        <button className="sidebar-button" onClick={() => pageChanger('/pages/OrderHome')}>Order Details</button>
        <button className="sidebar-button" onClick={() => pageChanger('/pages/CutHome')}>Cutting</button>
        <button className="sidebar-button" onClick={() => pageChanger('/comp/inqueue')}>Bundle</button>
        <button className="sidebar-button">Shift</button>
        <button className="sidebar-button" onClick={() => pageChanger('/comp/admin/pauseTime')}>Check Pause Time</button>
        <button className="sidebar-button" onClick={() => pageChanger('/components/AddNewUser')}>Add New User</button>
      </div>
      <div className="main-content">
        <div className="line-item">
          <div className="line-name1">Line</div>
          <div className="line-detail1">Efficiency</div>
          <div className="line-detail1">Incentive</div>
          <div className="line-detail1">Quality</div>
        </div>
        {lines.map(line => (
          <div className="line-item" key={line.id}>
            <div className="line-name">Line {line.id}</div>
            <div className="line-detail">{line.efficiency}</div>
            <div className="line-detail">{line.incentive}</div>
            <div className="line-detail">{line.quality}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

