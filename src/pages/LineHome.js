import React, { useState, useEffect, useRef } from 'react';
import SignOut from '../components/SignOut';
import Titlepic from '../components/Titlepic';
import { database } from '../Firebase'; // Adjust the import path as needed
import { ref, get, set,remove, onValue, serverTimestamp, push } from 'firebase/database';
import Modal from '../components/Line/Model';
import BreakTimeModal from '../components/Line/BreakTimeModel';
import RejectionModal from '../components/Line/PasswordModel';
import {  query, orderByChild, equalTo, update, runTransaction } from 'firebase/database';
import { Helmet } from 'react-helmet';
import LunchTimeModal from '../components/Line/LunchTimeModal';


export default function LineHome() {

  // const[productionPO,serProductioPo]=useState('');
  const [firstQuality, setFirstQuality] = useState(0);

  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);


  const [id, setId] = useState('');
  const [employees, setEmployees] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBreakTimeModalOpen, setIsBreakTimeModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLunchTimeModalOpen, setIsLunchTimeModalOpen] = useState(false);
  

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);


  const [selectedLine, setSelectedLine] = useState('');
 
  useEffect(() => {
    retrievemembersData(selectedLine);
    retrieveTotalFirstQuality(selectedLine);
    retrieveEffiency(selectedLine);
    retrieveIncentive(selectedLine);
    fetchMembers();
  }, [selectedLine]);

    const validateInputs = () => {
      return selectedBundle !== "" || (selectedIncompleteBundle !== "" || selectedBundle !== "");
    };

  const handleStart = async ()  => { 

    if(!validateInputs()){
      alert("Select order to start the process");
      return;
    }

    const id = setInterval(() => {
      setTimer(prevTime => prevTime + 1);
    }, 1000);
    setIntervalId(id);

    const currentDate = new Date().toISOString().split('T')[0];

    const previousSelectedIncompleteBundle = selectedIncompleteBundle;

    // Define the reference for dailyUpdates using the current date and selected line
    const dailyUpdatesRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}`);

    let totalMembers;
      try {
        const snapshot = await get(dailyUpdatesRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const guestMembers = data.guestMembers || 0;  // Get guestMembers or default to 0
            const hostMembers = data.hostMembers || 0;    // Get hostMembers or default to 0
            
            totalMembers = guestMembers + hostMembers;
            if(totalMembers=== 0){
              alert("Can't start order without any employees.");
              return;
            }  
        } else {
            console.log("No data available for the given date and line");
            alert("Can't start order without any employees.");
            return; // Return 0 if no data is found
        }
    } catch (error) {
        console.error("Error retrieving data: ", error);
        return;
    }
    const totalRunTimeRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}/runTime/${totalMembers}`); 

    setIsStarted(true);
    setIsPaused(false);
    setIsFinished(false);

    let inqueueRef;
    let operationsRef;
    if (selectedIncompleteBundle) {
      operationsRef = ref(database, `currentOperations/${selectedLine}/${selectedIncompleteBundle}`);
      inqueueRef = ref(database, `Inqueue/${selectedLine}/${selectedIncompleteBundle}`);
      retrieveFirstQuality(selectedLine);
      countQualities();
    } else if (selectedBundle) {
      operationsRef = ref(database, `currentOperations/${selectedLine}/${selectedBundle}`);
      inqueueRef = ref(database, `Inqueue/${selectedLine}/${selectedBundle}`);
    } else {
      console.error("No valid selection made.");
      return;
    }
    
    setSelectedIncompleteBundle("");

    const snapshot = await get(operationsRef);
    
    if (!snapshot.exists()) {
    const inqueueSnapshot = await get(inqueueRef);
    let noOfPieces = 0;
    let ItalyPo="";
    let ProductionPo="";
    let Size="";
      
    if (inqueueSnapshot.exists()) {
      const inqueueData = inqueueSnapshot.val();
      noOfPieces = inqueueData.noOfPieces || 0; // Retrieve noOfPieces from Inqueue, default to 0 if not found
      ItalyPo = inqueueData.italyPo || ''; // Retrieve italyPo from Inqueue, default to empty string if not found
      ProductionPo = inqueueData.productionPo || ''; 
      Size = inqueueData.size || '';
    } else {
      console.warn("Missing data in inqueue");
      return;
    }
  
    const newData = {
      lineNumber: selectedLine,
      orderId: orderData.orderNumber,
      bundleId: selectedBundle,
      italyPo: ItalyPo, // Use the retrieved italyPo
      productionPO: ProductionPo, // Use the retrieved productionPo
      size: Size,
      styleNumber: orderData.styleNumber,
      colour: orderData.colour,
      colourCode: orderData.colourCode,
      Smv: orderData.smv,
      "1stQuality": 0,
      "2ndQuality": 0,
      "Rejection": 0,
      noOfPieces: noOfPieces, // Set noOfPieces from Inqueue
      orderStartTime:serverTimestamp(),
    };
  
      set(operationsRef, newData)
      .then(() => {
        console.log('Data saved successfully to current operations node!');
       // remove(inqueueRef);
      })
      
      .catch((error) => {
          console.error('Error adding data:', error);
        });
      
        try {
          // Fetch the current data from the dailyUpdatesRef
          const snapshot = await get(dailyUpdatesRef);
          const runTimeSnapshot = await get(totalRunTimeRef);
          const dailyData = snapshot.val();
          const runData = runTimeSnapshot.val();

          if (dailyData.Smv!=="") {
            
            const startTime = dailyData.startTime || serverTimestamp();
            const endTime = dailyData.endTime || serverTimestamp(); // If endTime doesn't exist, use the current time
            const existingPauseTime = dailyData.pauseTime || 0;
            const existingRunTime = runData.runTime || 0;
            const status = dailyData.isPaused
        
            const  operationsSmvRef = ref(database, `currentOperations/${selectedLine}/${selectedBundle}/Smv`);
            const snap = await get(operationsSmvRef);
            let smv ="";
            let dailySmv;
            if(snap.exists()){
                  smv = snap.val()
            }
            const dailySmvRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}/Smv`);
            const dailySnap = await get(dailySmvRef);
            if(dailySnap.exists()){
              dailySmv = dailySnap.val();
            }
            if(smv!==dailySmv){
              await handleCalculateAndSaveEffiency(selectedLine);
              await update(dailyUpdatesRef, {
                Smv: smv,
                total1stQuality:"",
              }) 
            }
            const endMillis = new Date(endTime).getTime();
            let timeDifferenceMillis; 
            const startMillis = new Date().getTime();  // Convert startTime to milliseconds
            timeDifferenceMillis = startMillis - endMillis;   // Time from start to pause

            // Check if startTime already exists
            if (status) {
              console.log("Already started order in this line");
              // Handle cases where time difference is negative (should not happen)
              if (timeDifferenceMillis < 0) {
                console.error("Invalid data: endTime is earlier than startTime.");
                return;
              }
              // Convert runtime to seconds
              const newPauseTimeSeconds = Math.floor(timeDifferenceMillis / 1000);
              console.log("new "+ newPauseTimeSeconds)
              // Add the new runtime to the accumulated runtime
              const newPauseTime = existingPauseTime+ newPauseTimeSeconds;

              // Update the dailyUpdatesRef with the new pause time
              await update(dailyUpdatesRef, {
                pauseTime: newPauseTime, // Update with calculated pause time
                startTime: serverTimestamp(), // Optionally update the startTime to resume
                isPaused: false,
              })
                .then(() => {
                  console.log('Pause time calculated and updated successfully.');
                  setSelectedIncompleteBundle(previousSelectedIncompleteBundle);
                })
                .catch((error) => {
                  console.error('Error updating pause time:', error);
                });
            } else {
              console.log("previous order didnt pause "+existingRunTime)
              const currenttMillis = new Date().getTime();  // Convert startTime to milliseconds
              const start = new Date(startTime).getTime(); 
              timeDifferenceMillis = currenttMillis - start; 

              // Handle cases where time difference is negative (should not happen)
              if (timeDifferenceMillis < 0) {
                console.error("Invalid data: endTime is earlier than startTime.");
                return;
              }
              // Convert runtime to seconds
              const newRunTimeSeconds = Math.floor(timeDifferenceMillis / 1000);
              console.log("new "+newRunTimeSeconds)

              // Add the new runtime to the accumulated runtime          
               const newRunTime = existingRunTime+ newRunTimeSeconds;
 
              // Update the dailyUpdatesRef with the new pause time
              
              await update(totalRunTimeRef, {
                runTime: newRunTime, // Update with calculated pause time
              }) 
              await update(dailyUpdatesRef, {
               // runTime: newRunTime, // Update with calculated pause time
                startTime: serverTimestamp(), // Optionally update the endTime to resume
              })
                .then(() => {
                  console.log('Run time calculated and updated successfully.');
                  setSelectedIncompleteBundle(previousSelectedIncompleteBundle);
                })
                .catch((error) => {
                  console.error('Error updating pause time:', error);
                });
            }
          } else {
            // If no data exists at the path, set the fields with default values
            //aluth dawasak aluth order ekak
            const  operationsSmvRef = ref(database, `currentOperations/${selectedLine}/${selectedBundle}/Smv`);
      
            const snap = await get(operationsSmvRef);
            let smv ="";
            if(snap.exists()){
               smv = snap.val()
            }
            await update(dailyUpdatesRef, {
              startTime: serverTimestamp(),
              endTime: serverTimestamp(),
              ///runTime: 0,
              pauseTime: 0,
              //isPaused:false
              Smv: smv,
            })
            // await update(totalRunTimeRef, {
            //   runTime: 0, // Update with calculated pause time
            // }) ;
            console.log("No data found. Default values were set.");
          }
          
        } catch (error) {
          console.error("Error checking or updating dailyUpdates:", error);
        }
    }else{

    console.log("Starting incomplete order. Data already exists in the operations node.");

    const dailySnapshot = await get(dailyUpdatesRef);
    const dailyData = dailySnapshot.val();
    const runTimeSnapshot = await get(totalRunTimeRef);
    const runData = runTimeSnapshot.val();


    if (dailyData.pauseTime!=="") {
      const startTime = dailyData.startTime || serverTimestamp();
      const endTime = dailyData.endTime || serverTimestamp(); // If endTime doesn't exist, use the current time
      const existingPauseTime = dailyData.pauseTime || 0;
      const existingRunTime = runData.runTime || 0;
      const status = dailyData.isPaused

      const  operationsSmvRef = ref(database, `currentOperations/${selectedLine}/${selectedIncompleteBundle}/Smv`);
      const snap = await get(operationsSmvRef);
      let smv ="";
      let dailySmv;
      if(snap.exists()){
            smv = snap.val()
      }
      const dailySmvRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}/Smv`);
      const dailySnap = await get(dailySmvRef);
      if(dailySnap.exists()){
        dailySmv = dailySnap.val();
      }
      if(smv!==dailySmv){
        await handleCalculateAndSaveEffiency(selectedLine);
        await update(dailyUpdatesRef, {
          Smv: smv,
          total1stQuality:"",
        })
      }
      const endMillis = new Date(endTime).getTime();
      let timeDifferenceMillis; 
     const startMillis = new Date().getTime();  // Convert startTime to milliseconds
     timeDifferenceMillis = startMillis - endMillis;   // Time from start to pause

     if(status){
      console.log("order pause "+existingPauseTime)
          
      // Handle cases where time difference is negative (should not happen)
      if (timeDifferenceMillis < 0) {
        console.error("Invalid data: endTime is earlier than startTime.");
        return;
      }
      // Convert runtime to seconds
      const newPauseTimeSeconds = Math.floor(timeDifferenceMillis / 1000);
      console.log("new "+newPauseTimeSeconds)
      // Add the new runtime to the accumulated runtime
      const newPauseTime = existingPauseTime+ newPauseTimeSeconds;

      // Update the dailyUpdatesRef with the new pause time
      await update(dailyUpdatesRef, {
        pauseTime: newPauseTime, // Update with calculated pause time
        startTime: serverTimestamp(), // Optionally update the startTime to resume
        isPaused: false,
      })
        .then(() => {
          console.log('Pause time calculated and updated successfully.');
          setSelectedIncompleteBundle(previousSelectedIncompleteBundle);
        })
        .catch((error) => {
          console.error('Error updating pause time:', error);
        });
     }else{
      console.log("order Run time"+existingRunTime)
      const currenttMillis = new Date().getTime();  // Convert startTime to milliseconds
      const start = new Date(endTime).getTime(); 
      timeDifferenceMillis = currenttMillis - start; 

       // Handle cases where time difference is negative (should not happen)
       if (timeDifferenceMillis < 0) {
        console.error("Invalid data: endTime is earlier than startTime.");
        return;
      }
      // Convert runtime to seconds
      const newRunTimeSeconds = Math.floor(timeDifferenceMillis / 1000);
      console.log("new "+newRunTimeSeconds)
      // Add the new runtime to the accumulated runtime
      const newRunTime = existingRunTime+ newRunTimeSeconds;

      // Update the dailyUpdatesRef with the new pause time
      await update(dailyUpdatesRef, {
        //runTime: newRunTime, // Update with calculated pause time
        startTime: serverTimestamp(), // Optionally update the endTime to resume
      })
      await update(totalRunTimeRef, {
        runTime: newRunTime, // Update with calculated pause time
      }) 
        .then(() => {
          console.log('Run time calculated and updated successfully.');
          setSelectedIncompleteBundle(previousSelectedIncompleteBundle);
        })
        .catch((error) => {
          console.error('Error updating pause time:', error);
        });
     }
     
    } else {
      console.log("This is first order of today.");
      const  operationsSmvRef = ref(database, `currentOperations/${selectedLine}/${selectedIncompleteBundle}/Smv`);
      const snap = await get(operationsSmvRef);
      let smv ="";
      if(snap.exists()){
            smv = snap.val()
      }
      await update(dailyUpdatesRef, {
        startTime: serverTimestamp(),
        endTime: serverTimestamp(),
        //runTime: 0,
        pauseTime: 0,
       // isPaused: false
       Smv: smv,
      })
      await update(totalRunTimeRef, {
        runTime: 0, // Update with calculated pause time
      }) 
      .then(() => {
        console.log("Start time set with default values.");
        setSelectedIncompleteBundle(previousSelectedIncompleteBundle);
      });
    }
    }
  };
  
  const handlePauseResume = () => {
    const previousSelectedIncompleteBundle = selectedIncompleteBundle;

    const currentDate = new Date().toISOString().split('T')[0];
    // Define the reference for dailyUpdates using the current date and selected line
    const dailyUpdatesRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}`);

    setSelectedIncompleteBundle("");
  
    if (!isPaused) {
      // Pausing: update endTime and stop the timer
      clearInterval(intervalId);
  
      update(dailyUpdatesRef , {
        endTime: serverTimestamp(),  // Save the end time
        isPaused:true
      })
      .then(() => {
        console.log("End time and isPaused status updated in the database.");
        setSelectedIncompleteBundle(previousSelectedIncompleteBundle);
        calculateRunTime(selectedLine);  // Calculate runtime after updating end time
      }).then(()=>{
        calculateTotalWorkTime(selectedLine);
      })
      .catch((error) => {
        console.error("Failed to update endTime or isPaused:", error);
      });
    } else {
      // Resuming: update pauseTime and restart the timer
      update(dailyUpdatesRef , {
        startTime: serverTimestamp(),  // Save the current pause time
        isPaused: false
      })
      .then(() => {
        console.log("Pause time and isPaused status updated in the database.");
        setSelectedIncompleteBundle(previousSelectedIncompleteBundle);
        calculatePauseTime (selectedLine);
        // Restart the timer
        const id = setInterval(() => {
          setTimer((prevTime) => prevTime + 1);
        }, 1000);
        setIntervalId(id);
      })
      .catch((error) => {
        console.error("Failed to update pauseTime or isPaused:", error);
      });
    }
  
    setIsPaused(!isPaused);  // Toggle pause/resume state
  };
  
  
  const handleFinish = async() => {
    setIsFinished(true);
    setIsStarted(false);
    setIsPaused(false);
    //clearInterval(intervalId);

    setSelectedBundle("");          
    setSelectedIncompleteBundle(""); 
    setFirstQuality("");
    setPendingValue(null);
    setOrderData(null);
    setIncompleteBundleData(null);
  
    const currentDate = new Date().toISOString().split('T')[0];
    const dailyUpdatesRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}`);
    await update(dailyUpdatesRef ,{
      isPaused: true,
    });


  };


  const calculateRunTime = async (selectedLine) => {

    const previousSelectedIncompleteBundle = selectedIncompleteBundle;

    const currentDate = new Date().toISOString().split('T')[0];
  
    // Define the reference for dailyUpdates using the current date and selected line
    const dailyUpdatesRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}`);
    let totalMembers;
      try {
        const snapshot = await get(dailyUpdatesRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const guestMembers = data.guestMembers || 0;  // Get guestMembers or default to 0
            const hostMembers = data.hostMembers || 0;    // Get hostMembers or default to 0
            
            totalMembers = guestMembers + hostMembers;
            if(totalMembers=== 0){
              return;
            }  
        } else {
            console.log("No data available for the given date and line");
            return; // Return 0 if no data is found
        }
    } catch (error) {
        console.error("Error retrieving data: ", error);
        return;
    }

    
    const totalRunTimeRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}/runTime/${totalMembers}`);

    setSelectedIncompleteBundle("");
  
    try {
      // Fetch the current operation data from Firebase
      const snapshot = await get(dailyUpdatesRef);
      const runSnapshot = await get(totalRunTimeRef);
      if (!snapshot.exists()) {
        console.error("Operation data does not exist.");
        return;
      }   
      
      const operationData = snapshot.val();
      const {
        startTime,
        endTime,
        //runTime , // Total runtime accumulated across pauses
      } = operationData;

      const runData = runSnapshot.val();
      const {
        runTime , // Total runtime accumulated across pauses
      } = runData;
  
      // Ensure startTime exists for calculations
      if (!startTime) {
        console.error("Start time is missing.");
        return;
      }
      console.log("Run Time of ealier : " + runTime);
      // Convert Firebase timestamps to milliseconds
      const endMillis = new Date(endTime).getTime();
      let timeDifferenceMillis;
  
      const startMillis = new Date(startTime).getTime();  // Convert startTime to milliseconds
      timeDifferenceMillis = endMillis-startMillis ;   // Time from start to pause
      
  
      // Handle cases where time difference is negative (should not happen)
      if (timeDifferenceMillis < 0) {
        console.error("Invalid data: endTime is earlier than startTime.");
        return;
      }
     // getCurrentRunTime(selectedLine);
      // Convert runtime to seconds
      const newRunTimeSeconds = Math.floor(timeDifferenceMillis / 1000);
  
      // Add the new runtime to the accumulated runtime
      const updatedRuntime = runTime + newRunTimeSeconds;

      await update(totalRunTimeRef, {
        runTime: updatedRuntime,          // Update runtime in real-time
      });
  
  
      setSelectedIncompleteBundle(previousSelectedIncompleteBundle);
      console.log("Runtime updated and selectedIncompleteBundle set.");
      console.log("Run Time: " + updatedRuntime);
      
    } catch (error) {
      console.error("Error calculating and updating runtime:", error);
    }
  };
  
  const calculatePauseTime = async (selectedLine) => {   
    const previousSelectedIncompleteBundle = selectedIncompleteBundle;

    const currentDate = new Date().toISOString().split('T')[0];
    // Define the reference for dailyUpdates using the current date and selected line
    const dailyUpdatesRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}`);
  
    setSelectedIncompleteBundle("");
  
    try {
      const snapshot = await get(dailyUpdatesRef);
      if (!snapshot.exists()) {
        console.error("Operation data does not exist.");
        return;
      }
      const operationData = snapshot.val();
      const {
        startTime,
        endTime,
        pauseTime , // Total runtime accumulated across pauses
      } = operationData;
  
      // Ensure startTime exists for calculations
      if (!startTime) {
        console.error("Start time is missing.");
        return;
      }
      console.log("pause Time of ealier : " + pauseTime);
      // Convert Firebase timestamps to milliseconds
      const endMillis = new Date(endTime).getTime();
      let timeDifferenceMillis;
  
      const startMillis = new Date(startTime).getTime();  // Convert startTime to milliseconds
      timeDifferenceMillis = startMillis -endMillis;   // Time from start to pause
      
  
      // Handle cases where time difference is negative (should not happen)
      if (timeDifferenceMillis < 0) {
        console.error("Invalid data: endTime is earlier than startTime.");
        return;
      }
  
      // Convert runtime to seconds
      const newPauseTimeSeconds = Math.floor(timeDifferenceMillis / 1000);
  
      // Add the new runtime to the accumulated runtime
      const updatedPausetime = pauseTime + newPauseTimeSeconds;
  
      // Update the runtime and accumulatedRunTime in Firebase
      await update(dailyUpdatesRef, {
        pauseTime: updatedPausetime,          // Update runtime in real-time
        //accumulatedRunTime: updatedRuntime // Keep track of the total accumulated runtime
      });
      setSelectedIncompleteBundle(previousSelectedIncompleteBundle);
      console.log("Runtime updated and selectedIncompleteBundle set.");
      console.log("Pause: " + updatedPausetime);
  
    } catch (error) {
      console.error("Error calculating and updating runtime:", error);
    }
  };
  
  
  const getCurrentRunTime = async (selectedLine) => {

    const previousSelectedIncompleteBundle = selectedIncompleteBundle;
    const currentDate = new Date().toISOString().split('T')[0];

    // Define the reference for dailyUpdates using the current date and selected line
    const dailyUpdatesRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}`);
    let totalMembers;
      try {
        const snapshot = await get(dailyUpdatesRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const guestMembers = data.guestMembers || 0;  // Get guestMembers or default to 0
            const hostMembers = data.hostMembers || 0;    // Get hostMembers or default to 0
            
            totalMembers = guestMembers + hostMembers;
            if(totalMembers=== 0){
              return;
            }  
        } else {
            console.log("No data available for the given date and line");
            return; // Return 0 if no data is found
        }
    } catch (error) {
        console.error("Error retrieving data: ", error);
        return;
    }

    
    const totalRunTimeRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}/runTime/${totalMembers}`);

    setSelectedIncompleteBundle("");

    try {
      // Update the pauseTime in dailyUpdates
      await update(dailyUpdatesRef, {
        endTime:serverTimestamp(),
      });
      console.log("Run time successfully added to dailyUpdates.");
    } catch (error) {
      console.error("Error updating dailyUpdates:", error);
    }

    try {
      // Fetch data from the current operation node
      const snapshot = await get(dailyUpdatesRef);
      const runSnapshot = await get(totalRunTimeRef);

      if (!snapshot.exists()) {
        console.error("Operation data does not exist.");
        return;
      }

      // Retrieve startTime, pauseTime, and runtime from the current operation data
      //const operationData = snapshot.val();
      const operationData1 = snapshot.val();
      console.log("Operation data from Firebase:", operationData1);
    
      const {
        startTime,
        endTime,
        //runTime = 0,
      } = operationData1;

      const runData = runSnapshot.val();
      const {
        runTime = 0 , // Total runtime accumulated across pauses
      } = runData;
    
        // Check if endTime exists
    if (!endTime) {
      console.error("endTime is undefined or missing.");
      return;
    }
      console.log("used run"+runTime);
      // Get the current time as the "temporary" end time
      const currentMillis = new Date().getTime();
      const startMillis = new Date(startTime).getTime();
      // Check if startMillis is valid
    if (isNaN(startMillis)) {
      console.error("Invalid startMillis, unable to calculate time difference.");
      return;
    }
      let timeDifferenceMillis;
      timeDifferenceMillis =  currentMillis -startMillis;
     
      

      if (timeDifferenceMillis < 0) {
        console.error("Invalid data: current time is earlier than startTime/pauseTime.");
        return;
      }

      // Convert the time difference to seconds
      const newRunTimeSeconds = Math.floor(timeDifferenceMillis / 1000);
      console.log("run test: "+newRunTimeSeconds)
      // Calculate the total runtime by adding the current runtime to the accumulated runtime
      const updatedRuntime = runTime + newRunTimeSeconds;

      try {
        // Update the pauseTime in dailyUpdates
        await update(dailyUpdatesRef, {
          //runTime: updatedRuntime ,// Add or update the pauseTime under dailyUpdates
          startTime:endTime,
        });
        await update(totalRunTimeRef, {
          runTime: updatedRuntime ,// Add or update the pauseTime under dailyUpdates
          //startTime:endTime,
        });

        console.log("Run time successfully added to dailyUpdates.");

      } catch (error) {
        console.error("Error updating dailyUpdates:", error);
      }
      setSelectedIncompleteBundle(previousSelectedIncompleteBundle);
      console.log("Current Total Runtime: " + updatedRuntime + " seconds");
      return updatedRuntime;

    } catch (error) {
      console.error("Error fetching and calculating runtime:", error);
    }
};

  //Assign employee part


  useEffect(() => {
    console.log('Selected Line:', selectedLine); // Debug: Log the selected line
  
    // Create a reference to the 'employee' node
    const employeeRef = ref(database, 'employees');
  
    // Create a query to get employees with the selected line allocation
    const employeeQuery = query(employeeRef, orderByChild('lineAllocation'), equalTo(selectedLine));
  
    // Fetch data
    get(employeeQuery)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const employeeData = [];
          snapshot.forEach((childSnapshot) => {
            employeeData.push(childSnapshot.val());
          });
          console.log('Employee Data:', employeeData); // Debug: Log retrieved data
          setEmployees(employeeData);
        } else {
          console.log('No employees found for the selected line.');
        }
      })
      .catch((error) => {
        console.error('Error fetching employee data:', error);
      });
      // if (selectedLine) {
      //   retrieveAndSetDropdownOptions(selectedLine);
      // }
  }, [selectedLine]);


  const handleInputChange1 = (e) => {
    setId(e.target.value);
  };

   
const firstTotalRunTime = async(selectedLine)=>{
  const currentDate = new Date().toISOString().split('T')[0];

  // Define the reference for dailyUpdates using the current date and selected line
  const dailyUpdatesRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}`);
  let totalMembers;
    try {
      const snapshot = await get(dailyUpdatesRef);
      if (snapshot.exists()) {
          const data = snapshot.val();
          const guestMembers = data.guestMembers || 0;  // Get guestMembers or default to 0
          const hostMembers = data.hostMembers || 0;    // Get hostMembers or default to 0
          
          totalMembers = guestMembers + hostMembers;
          if(totalMembers=== 0){
            return;
          }  
      } else {
          console.log("No data available for the given date and line");
          return; // Return 0 if no data is found
      }
  } catch (error) {
      console.error("Error retrieving data: ", error);
      return;
  }
  
  const totalRunTimeRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}/runTime/${totalMembers}`);
  const runTimeSnapshot = await get(totalRunTimeRef);

  if (runTimeSnapshot.exists()) {
    console.log("already it set the time");
    return;
  }else{
    await update(totalRunTimeRef, {
      runTime: 0, // Update with calculated pause time
    })
    console.log("run Time set to 0");
  }
 
}


  // // const updateCurrentOperations = async(id, selectedLine) => {
  //   const employeesRef = ref(database, 'employees');
  
  //   // Query to check if the employee exists
  //   const employeeQuery = query(
  //     employeesRef,
  //     orderByChild('employeeNumber'),
  //     equalTo(id)
  //   );
  //   const employeeSnapshot = await get(employeeQuery);
  //   // get(employeeQuery)
  //   //   .then((employeeSnapshot) => {
  //       if (employeeSnapshot.exists()) {
  //         // Employee exists, now check line allocation
  //         let lineAllocation = null;
  //         let employeeName = null;
  
  //         // Since snapshot may have multiple children, iterate over them to get the employee data
  //         employeeSnapshot.forEach((childSnapshot) => {
  //           //lineAllocation = childSnapshot.val().lineAllocation;
  //           const employeeData = childSnapshot.val();
  //           lineAllocation = employeeData.lineAllocation;
  //           employeeName = employeeData.callingName;
  //         });

  //         const saveResult = await saveEmployee(id, employeeName);
  //         if (!saveResult) {
  //             return; // Stop further processing
  //         }
  //         const currentDate = new Date().toISOString().split('T')[0];
  //         // Define the reference for dailyUpdates using the current date and selected line
  //         const dailyUpdatesRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}`);
  
  //         get(dailyUpdatesRef)
  //           .then((dailySnapshot) => {
  //             if (dailySnapshot.exists()) {
  //               // Daily data exists
  //               const dailyData = dailySnapshot.val();
  //               const currentHostMembers = dailyData.hostMembers || 0;
  //               const currentGuestMembers = dailyData.guestMembers || 0;
  //               const status = dailyData.isPaused;
  
  //               if (status) {
  //                 if (lineAllocation === selectedLine) {
  //                   // Update hostMembers
  //                   const updatedHostMembers = currentHostMembers + 1;
  
  //                   update(dailyUpdatesRef, { hostMembers: updatedHostMembers })
  //                     .then(() => {
  //                       console.log('Host members count updated successfully!');
  //                       setId("");
  //                       firstTotalRunTime(selectedLine);
  //                     })
  //                     .catch((error) => {
  //                       console.error('Error updating host members count:', error);
  //                     });
  //                 } else {
  //                   // Update guestMembers
  //                   const updatedGuestMembers = currentGuestMembers + 1;
  
  //                   update(dailyUpdatesRef, { guestMembers: updatedGuestMembers })
  //                     .then(() => {
  //                       console.log('Guest members count updated successfully!');
  //                       setId("");
  //                       firstTotalRunTime(selectedLine);
  //                     })
  //                     .catch((error) => {
  //                       console.error('Error updating guest members count:', error);
  //                     });
  //                 }
  //               } else {
  //                 getCurrentRunTime(selectedLine);
  //                 if (lineAllocation === selectedLine) {
  //                   // Update hostMembers
  //                   const updatedHostMembers = currentHostMembers + 1;
  
  //                   update(dailyUpdatesRef, { hostMembers: updatedHostMembers })
  //                     .then(() => {
  //                       console.log('Host members count updated successfully!');
  //                       setId("");
  //                       firstTotalRunTime(selectedLine);
  //                     })
  //                     .catch((error) => {
  //                       console.error('Error updating host members count:', error);
  //                     });
  //                 } else {
  //                   // Update guestMembers
  //                   const updatedGuestMembers = currentGuestMembers + 1;
  
  //                   update(dailyUpdatesRef, { guestMembers: updatedGuestMembers })
  //                     .then(() => {
  //                       console.log('Guest members count updated successfully!');
  //                       setId("");
  //                       firstTotalRunTime(selectedLine);
  //                     })
  //                     .catch((error) => {
  //                       console.error('Error updating guest members count:', error);
  //                     });
  //                 }
  //               }
  //             } else {
  //               // Daily data does not exist, initialize it with 0 for hostMembers and guestMembers
  //               const initialData = {
  //                 hostMembers: 0,
  //                 guestMembers: 0,
  //                 isPaused: true,
  //               };
  
  //               set(dailyUpdatesRef, initialData)
  //                 .then(() => {
  //                   console.log('Daily data initialized successfully!');
  
  //                   // Set totalMembers to 1
  //                   const totalMembers = 1;
  
  //                   // After initializing, update based on the lineAllocation
  //                   if (lineAllocation === selectedLine) {
  //                     // Update hostMembers
  //                     update(dailyUpdatesRef, { 
  //                       hostMembers: 1,
  //                       startTime:"",
  //                       endTime:"",
  //                       pauseTime: "",
  //                       Smv: "",
  //                       CurrentEffiency: "",
  //                       Incentive:"",
  //                     })
  //                       .then(() => {
  //                         console.log('Host members count set to 1.');
  //                         setId("");
  
  //                         // Update runTime to 0 for the totalMembers
  //                         const totalRunTimeRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}/runTime/${totalMembers}`);
  //                         set(totalRunTimeRef, {
  //                           runTime: 0,
  //                         }
  //                         )
  //                           .then(() => {
  //                             console.log('RunTime initialized to 0 for totalMembers 1.');
  //                           })
  //                           .catch((error) => {
  //                             console.error('Error initializing runTime for totalMembers 1:', error);
  //                           });
  //                       })
  //                       .catch((error) => {
  //                         console.error('Error setting host members count:', error);
  //                       });
  //                   } else {
  //                     // Update guestMembers
  //                     update(dailyUpdatesRef, { 
  //                       guestMembers: 1,
  //                       startTime:"",
  //                       endTime:"",
  //                       pauseTime: "",
  //                       Smv: "",
  //                       CurrentEffiency:"",
  //                       Incentive:"",
  //                      })
  //                       .then(() => {
  //                         console.log('Guest members count set to 1.');
  //                         setId("");
  
  //                         // Update runTime to 0 for the totalMembers
  //                         const totalRunTimeRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}/runTime/${totalMembers}`);
  //                         set(totalRunTimeRef, {
  //                           runTime: 0,
  //                         })
  //                           .then(() => {
  //                             console.log('RunTime initialized to 0 for totalMembers 1.');
  //                           })
  //                           .catch((error) => {
  //                             console.error('Error initializing runTime for totalMembers 1:', error);
  //                           });
  //                       })
  //                       .catch((error) => {
  //                         console.error('Error setting guest members count:', error);
  //                       });
  //                   }
  //                 })
  //                 .catch((error) => {
  //                   console.error('Error initializing daily data:', error);
  //                 });
  //             }
  //           })
  //           .catch((error) => {
  //             console.error('Error fetching daily data:', error);
  //           });
  //       } else {
  //         console.log('No employee found with the given ID.');
  //         alert('No employee found with the given ID.');
  //       }
  //     // })
  //     // .catch((error) => {
  //     //   console.error('Error fetching employee data:', error);
  //     // });
  // };

  const updateCurrentOperations = async (id, selectedLine) => {
    const employeesRef = ref(database, 'employees');
  
    // Query to check if the employee exists
    const employeeQuery = query(
      employeesRef,
      orderByChild('employeeNumber'),
      equalTo(id)
    );
  
    try {
      const employeeSnapshot = await get(employeeQuery);
  
      if (employeeSnapshot.exists()) {
        // Employee exists, now check line allocation
        let lineAllocation = null;
        let employeeName = null;
  
        // Since snapshot may have multiple children, iterate over them to get the employee data
        employeeSnapshot.forEach((childSnapshot) => {
          const employeeData = childSnapshot.val();
          lineAllocation = employeeData.lineAllocation;
          employeeName = employeeData.callingName;
        });
  
        const saveResult = await saveEmployee(id, employeeName,selectedLine);
        if (!saveResult) {
          return; // Stop further processing
        }
  
        const currentDate = new Date().toISOString().split('T')[0];
        const dailyUpdatesRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}`);
  
        const dailySnapshot = await get(dailyUpdatesRef);
        
        if (dailySnapshot.exists()) {
          // Daily data exists
          const dailyData = dailySnapshot.val();
          const currentHostMembers = dailyData.hostMembers || 0;
          const currentGuestMembers = dailyData.guestMembers || 0;
          const status = dailyData.isPaused;
  
          if (status) {
            if (lineAllocation === selectedLine) {
              const updatedHostMembers = currentHostMembers + 1;
              await update(dailyUpdatesRef, { hostMembers: updatedHostMembers });
              console.log('Host members count updated successfully!');
              setId("");
              firstTotalRunTime(selectedLine);
            } else {
              const updatedGuestMembers = currentGuestMembers + 1;
              await update(dailyUpdatesRef, { guestMembers: updatedGuestMembers });
              console.log('Guest members count updated successfully!');
              setId("");
              firstTotalRunTime(selectedLine);
            }
          } else {
            getCurrentRunTime(selectedLine);
            if (lineAllocation === selectedLine) {
              const updatedHostMembers = currentHostMembers + 1;
              await update(dailyUpdatesRef, { hostMembers: updatedHostMembers });
              console.log('Host members count updated successfully!');
              setId("");
              firstTotalRunTime(selectedLine);
            } else {
              const updatedGuestMembers = currentGuestMembers + 1;
              await update(dailyUpdatesRef, { guestMembers: updatedGuestMembers });
              console.log('Guest members count updated successfully!');
              setId("");
              firstTotalRunTime(selectedLine);
            }
          }
        } else {
         
          // Daily data does not exist, initialize it
          const initialData = {
            hostMembers: 0,
            guestMembers: 0,
            isPaused: true,
          };
  
          await set(dailyUpdatesRef, initialData);
          console.log('Daily data initialized successfully!');
  
          const totalMembers = 1;
          if (lineAllocation === selectedLine) {
            await update(dailyUpdatesRef, {
              hostMembers: 1,
              startTime: "",
              endTime: "",
              pauseTime: "",
              Smv: "",
              CurrentEffiency: "",
              Incentive: "",
            });
            console.log('Host members count set to 1.');
            setId("");
  
            const totalRunTimeRef = ref(
              database,
              `dailyUpdates/${currentDate}/${selectedLine}/runTime/${totalMembers}`
            );
            await set(totalRunTimeRef, { runTime: 0 });
            console.log('RunTime initialized to 0 for totalMembers 1.');
          } else {
            await update(dailyUpdatesRef, {
              guestMembers: 1,
              startTime: "",
              endTime: "",
              pauseTime: "",
              Smv: "",
              CurrentEffiency: "",
              Incentive: "",
            });
            console.log('Guest members count set to 1.');
            setId("");
  
            const totalRunTimeRef = ref(
              database,
              `dailyUpdates/${currentDate}/${selectedLine}/runTime/${totalMembers}`
            );
            await set(totalRunTimeRef, { runTime: 0 });
            console.log('RunTime initialized to 0 for totalMembers 1.');
          }
        }
      } else {
        console.log('No employee found with the given ID.');
        alert('No employee found with the given ID.');
      }
    } catch (error) {
      console.error('Error processing operation:', error);
    }
  };
  
  
  const saveEmployee = async (employeeNumber, employeeName, selectedLine) => {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    console.log("Checking for employee:", employeeNumber);
  
    // Define the reference to check if the employee exists in any line for the day
    const workRef = ref(database, `workingMembers/${currentDate}`);
    console.log("Database reference:", workRef);
  
    try {
      const snapshot = await get(workRef);
  
      if (snapshot.exists()) {
        let isEmployeeAssigned = false;
  
        // Iterate through all lines for the current date
        snapshot.forEach((lineSnapshot) => {
          const lineData = lineSnapshot.val();
          console.log("Line data for:", lineSnapshot.key, lineData);
  
          // Check if the workingMembers exists for the selected line and if the employeeNumber is assigned
          if (lineData && lineData[employeeNumber]) {
            console.log(`Employee ${employeeNumber} is already assigned in line ${lineSnapshot.key}`);
            isEmployeeAssigned = true;
          }
        });
  
        if (isEmployeeAssigned) {
          console.log("Employee is already assigned for today.");
          alert("This employee is already assigned for today!");
          return false; // Stop further processing
        } else {
          // Save the employee data if they are not assigned to any line for today
          const workingMembersRef = ref(
            database,
            `workingMembers/${currentDate}/${selectedLine}/${employeeNumber}`
          );
  
          try {
            await set(workingMembersRef, {
              employeeNumber,
              employeeName,
            });
            console.log("Employee saved successfully!");
            fetchMembers();
            return true;
          } catch (error) {
            console.error("Error saving employee data:", error);
            return false;
          }
        }
      } else {
        // No data for the day, save directly
        const workingMembersRef = ref(
          database,
          `workingMembers/${currentDate}/${selectedLine}/${employeeNumber}`
        );
  
        try {
          await set(workingMembersRef, {
            employeeNumber,
            employeeName,
          });
          console.log("Employee saved successfully!");
          return true;
        } catch (error) {
          console.error("Error saving employee data:", error);
          return false;
        }
      }
    } catch (error) {
      console.error("Error checking existing employee data:", error);
      return false;
    }
  };
  
  const [members, setMembers] = useState([]);

const fetchMembers = async () => {
  const currentDate = new Date().toISOString().split('T')[0]; 
  const lineRef = ref(database, `workingMembers/${currentDate}/${selectedLine}`);
  try {
    const snapshot = await get(lineRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const membersArray = Object.keys(data).map((key) => ({
        employeeNumber: key,
        ...data[key],
      }));
      setMembers(membersArray); // Update state with members data
    } else {
      setMembers([]); // No members assigned for the line
    }
  } catch (error) {
    console.error("Error fetching members:", error);
  }
};

// Remove member from the database
const handleRemoveMember = async (employeeNumber) => {
  const confirmed = window.confirm('Are you sure you want to remove this employee');
    if (confirmed) {
  const currentDate = new Date().toISOString().split('T')[0]; 
  
  const employeesRef = ref(database, 'employees');
  
    // Query to check if the employee exists
    const employeeQuery = query(
      employeesRef,
      orderByChild('employeeNumber'),
      equalTo(employeeNumber)
    );
    let lineAllocation = null;
    try {
      const employeeSnapshot = await get(employeeQuery);
  
      if (employeeSnapshot.exists()) {
        // Employee exists, now check line allocation
        let lineAllocation = null;
        
  
        // Since snapshot may have multiple children, iterate over them to get the employee data
        employeeSnapshot.forEach((childSnapshot) => {
          const employeeData = childSnapshot.val();
          lineAllocation = employeeData.lineAllocation;
        });}
      } catch (error) {
          console.error('Error processing operation:', error);
        }
  const memberRef = ref(
    database,
    `workingMembers/${currentDate}/${selectedLine}/${employeeNumber}`
  );
  try {
    await remove(memberRef);
    if(lineAllocation===selectedLine){
      removeHostMember(selectedLine);
    }else{
      removeGuestMember(selectedLine);
    }
    //alert("Member removed successfully!");
    fetchMembers(); // Refresh the table after removal
  } catch (error) {
    console.error("Error removing member:", error);
    alert("Failed to remove member.");
  }
}
};
  
  const updateGuest = () => {
    updateCurrentOperations(id, selectedLine);
    retrievemembersData(selectedLine);
  };
  const updateHost = () => {
    retrievemembersData(selectedLine);  
  };
  

 const [data, setData] = useState(null);

  const retrievemembersData = (line) => {
    const currentDate = new Date().toISOString().split('T')[0];

    if (!line) {
      console.error("Line cannot be undefined");
      return;
    }

    const dbPath = `dailyUpdates/${currentDate}/${line}`;
    const dataRef = ref(database, dbPath);

    // Set up a real-time listener for the data
    const unsubscribe = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.val());
      } else {
        console.log("No data available");
        setData({ hostMembers: 0, guestMembers: 0 });
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    // Return the unsubscribe function to clean up the listener
    return unsubscribe;
  };

  const retrieveEffiency = (line) => {
    const currentDate = new Date().toISOString().split('T')[0];

    if (!line) {
      console.error("Line cannot be undefined");
      return;
    }

    const dbPath = `dailyUpdates/${currentDate}/${line}/CurrentEffiency`;
    const dataRef = ref(database, dbPath);

    // Set up a real-time listener for the data
    const unsubscribe = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        setEffiency(snapshot.val());
      } else {
        console.log("No data available");
        setEffiency(0);
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    // Return the unsubscribe function to clean up the listener
    return unsubscribe;
  };

  const retrieveIncentive = (line) => {
    const currentDate = new Date().toISOString().split('T')[0];

    if (!line) {
      console.error("Line cannot be undefined");
      return;
    }

    const dbPath = `dailyUpdates/${currentDate}/${line}/Incentive`;
    const dataRef = ref(database, dbPath);

    // Set up a real-time listener for the data
    const unsubscribe = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        setIncentive(snapshot.val());
      } else {
        console.log("No data available");
        setIncentive(0);
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    // Return the unsubscribe function to clean up the listener
    return unsubscribe;
  };

  const removeHostMember = (lineNumber) => {
    if (!lineNumber) {
      console.error("Line number cannot be undefined");
      return;
    }
  
    // Get the current date in 'YYYY-MM-DD' format
    const currentDate = new Date().toISOString().split('T')[0];
  
    // Reference to the daily updates node for the selected line
    const dailyUpdatesRef = ref(database, `dailyUpdates/${currentDate}/${lineNumber}`);
  
    get(dailyUpdatesRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const currentHostMembers = data.hostMembers || 0;
  
        // Ensure hostMembers count doesn't go below 0
        if (currentHostMembers > 0) {
          getCurrentRunTime(lineNumber);
          update(dailyUpdatesRef, { hostMembers: currentHostMembers - 1 })
            .then(() => {
              console.log(`Host member removed successfully from ${lineNumber}`);
            })
            .catch((error) => {
              console.error('Error removing host member:', error);
            });
        } else {
          console.log('No host members to remove.');
        }
      } else {
        console.log(`No data found for ${lineNumber} on ${currentDate}`);
      }
    }).catch((error) => {
      console.error('Error fetching daily updates:', error);
    });
  };
  
  const removeGuestMember = (lineNumber) => {
    if (!lineNumber) {
      console.error("Line number cannot be undefined");
      return;
    }
  
    // Get the current date in 'YYYY-MM-DD' format
    const currentDate = new Date().toISOString().split('T')[0];
  
    // Reference to the daily updates node for the selected line
    const dailyUpdatesRef = ref(database, `dailyUpdates/${currentDate}/${lineNumber}`);
  
    get(dailyUpdatesRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const currentGuestMembers = data.guestMembers || 0;
  
        // Ensure guestMembers count doesn't go below 0
        if (currentGuestMembers > 0) {
          getCurrentRunTime(lineNumber);
          update(dailyUpdatesRef, { guestMembers: currentGuestMembers - 1 })
            .then(() => {
              console.log(`Guest member removed successfully from ${lineNumber}`);
            })
            .catch((error) => {
              console.error('Error removing guest member:', error);
            });
        } else {
          console.log('No guest members to remove.');
        }
      } else {
        console.log(`No data found for ${lineNumber} on ${currentDate}`);
      }
    }).catch((error) => {
      console.error('Error fetching daily updates:', error);
    });
  };
  
  const handleUpdateFirstQuality = async (increment) => {
    try {
      // Determine the path based on user selection
      const previousSelectedIncompleteBundle = selectedIncompleteBundle;
      let orderUpdateRef;
  
      if (selectedIncompleteBundle) {
        orderUpdateRef = ref(database, `currentOperations/${selectedLine}/${selectedIncompleteBundle}`);
      } else if (selectedBundle) {
        orderUpdateRef = ref(database, `currentOperations/${selectedLine}/${selectedBundle}`);
      } else {
        console.error("No valid selection made.");
        return;
      }
  
      setSelectedIncompleteBundle("");
  
      const snapshot = await get(orderUpdateRef);
  
      if (snapshot.exists()) {
        const currentData = snapshot.val();
        const currentFirstQuality = currentData['1stQuality'] || 0;
        const newFirstQuality = currentFirstQuality + increment;
  
        // Update the 1stQuality field
        await update(orderUpdateRef, { '1stQuality': newFirstQuality });
  
        console.log(`1stQuality updated to ${newFirstQuality}`);
        setSelectedIncompleteBundle(previousSelectedIncompleteBundle);
        retrieveFirstQuality(selectedLine);
        countQualities();
      } else {
        alert('No data found for the selected order and bundle.');
      }
    } catch (error) {
      console.error('Error handling the 1stQuality update:', error);
      alert('An error occurred while updating 1stQuality.');
    }
  };
  


  const handleUpdateTotalFirstQuality = async (increment, lineNumber) => {
    try {
      // Create a reference to a temporary node to get the server timestamp
      const tempRef = ref(database, 'serverTime/temp');
  
      // Set the server timestamp temporarily to fetch it
      await set(tempRef, { timestamp: serverTimestamp() });
  
      // Fetch the server timestamp
      const snapshot = await get(tempRef);
      if (snapshot.exists()) {
        const serverTimestampValue = snapshot.val().timestamp;
        const serverDate = new Date(serverTimestampValue);
  
        // Format the server date to 'YYYY-MM-DD'
        const formattedServerDate = serverDate.toISOString().split('T')[0];
  
        // Construct the path for the daily updates under the server date and specific line
        const dailyUpdatesRef = ref(database, `dailyUpdates/${formattedServerDate}/${lineNumber}`);
  
        // Get the current data at the path
        const dailySnapshot = await get(dailyUpdatesRef);
        let currentTotalFirstQuality = 0;
  
        if (dailySnapshot.exists()) {
          currentTotalFirstQuality = dailySnapshot.val().total1stQuality || 0;
        }
  
        const newTotalFirstQuality = currentTotalFirstQuality + increment;
  
        // Update the total1stQuality field with the new value and add the server timestamp
        await update(dailyUpdatesRef, {
          total1stQuality: newTotalFirstQuality,
         // timestamp: serverTimestamp()  // Add the server timestamp here
        });
  
        console.log(`total1stQuality updated to ${newTotalFirstQuality} for ${lineNumber} on ${formattedServerDate}`);
        //alert(`total1stQuality updated to ${newTotalFirstQuality} for ${lineNumber} on ${formattedServerDate}`);
      } else {
        console.error('Error fetching server timestamp.');
        alert('Error fetching server timestamp.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred.');
    }
  };
  
  
  
  const handleUpdateQuality = async() => {
   await handleUpdateFirstQuality(1);
   await handleUpdateTotalFirstQuality(1, selectedLine); // Pass the selected line dynamically  
   await getCurrentRunTime(selectedLine);
   await calculateTotalWorkTime(selectedLine);
    
  };

  const handleUpdateQualityBy3 = async() => {
    await handleUpdateFirstQuality(3);
    await handleUpdateTotalFirstQuality(3, selectedLine); // Pass the selected line dynamically
    await getCurrentRunTime(selectedLine);
    await calculateTotalWorkTime(selectedLine);
  };


async function retrieveFirstQuality(selectedLine) {
  
  let orderUpdateRef;

  // Check user selection to define the correct path
  if (selectedIncompleteBundle) {
    orderUpdateRef = ref(database, `currentOperations/${selectedLine}/${selectedIncompleteBundle}`);
  } else if (selectedBundle) {
    orderUpdateRef = ref(database, `currentOperations/${selectedLine}/${selectedBundle}`);
  } else {
    console.error("No valid selection made.");
    return null;
  }

  try {
    // Retrieve the data from the path
    const snapshot = await get(orderUpdateRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const firstQualityValue = data?.['1stQuality'];

      if (firstQualityValue !== undefined) {
        console.log("1stQuality:", firstQualityValue);
        setFirstQuality(firstQualityValue);
        return firstQualityValue;
      } else {
        console.error("1stQuality not found in the selected bundle.");
        return null;
      }
    } else {
      console.error("No data found at the selected bundle path.");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving 1stQuality:", error);
    return null;
  }
}

const [totalFirstQuality, setTotalFirstQuality] = useState(null);


const retrieveTotalFirstQuality = async (lineNumber) => {
  if (!lineNumber) {
    console.error("Line number cannot be undefined");
    return;
  }

  // Get the current date in 'YYYY-MM-DD' format
  const currentDate = new Date().toISOString().split('T')[0];

  const effiencyRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}/Effiency`);
  let qualitySum = 0;
  let effiencySnapshot;
  try{
    effiencySnapshot = await get(effiencyRef );

    if(effiencySnapshot.exists()){
              // Loop through the entries and sum the totalWorkTimeinMinitues
              effiencySnapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                if (data.Quality) {
                  qualitySum  += data.Quality;
                }
              });
              console.log("quqlity "+qualitySum)     
    }
  }catch(error){
    console.error("Error retrieving runtime data:", error);
  }
  // Construct the path for the daily updates under the current date and specific line
  const dailyUpdatesRef = ref(database, `dailyUpdates/${currentDate}/${lineNumber}`);

  // Set up a real-time listener for the total1stQuality value
  const unsubscribe = onValue(dailyUpdatesRef, (snapshot) => {
    if (snapshot.exists()) {
      const totalFirstQuality = snapshot.val().total1stQuality || 0;
     // console.log(`Real-time Total 1st Quality for ${lineNumber} on ${currentDate}: ${totalFirstQuality}`);
     const finalTotal = qualitySum + totalFirstQuality;
      setTotalFirstQuality(finalTotal);
    } else {
      //console.log(`No data found for ${lineNumber} on ${currentDate}`);
      if(qualitySum!==0){
        setTotalFirstQuality(qualitySum);
      }else{
        setTotalFirstQuality(0); // Set to 0 if no data found
      }
    }
    
  }, (error) => {
    console.error("Error fetching real-time data:", error);
  });

  // Return the unsubscribe function to clean up the listener
  return unsubscribe;
};


// Function to update 2ndQuality
const handleUpdateSecondQuality = () => {

  const previousSelectedIncompleteBundle = selectedIncompleteBundle;
  
  let orderUpdateRef;
    if (selectedIncompleteBundle) {
      orderUpdateRef = ref(database, `currentOperations/${selectedLine}/${selectedIncompleteBundle}`);
    } else if (selectedBundle) {
      orderUpdateRef = ref(database, `currentOperations/${selectedLine}/${selectedBundle}`);
    } else {
      console.error("No valid selection made.");
      return;
    }
    setSelectedIncompleteBundle("");
  get(orderUpdateRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const currentData = snapshot.val();
        const currentSecondQuality = currentData['2ndQuality'] || 0;
        const newSecondQuality = currentSecondQuality + 1;

        // Update the 1stQuality field
        update(orderUpdateRef, { '2ndQuality': newSecondQuality })
          .then(() => {
            console.log(`2ndQuality updated to ${newSecondQuality}`);
            getCurrentRunTime(selectedLine);
            //setSelectedIncompleteBundle(previousSelectedIncompleteBundle);
            //alert(`2ndQuality updated to ${newSecondQuality}`);
            countQualities();
          })
          .catch((error) => {
            console.error('Error updating 2ndQuality:', error);
            alert('Error updating 2ndQuality.');
          });
      } else {
        alert('No data found for the selected order and bundle.');
      }
    })
    .catch((error) => {
      console.error('Error fetching order data:', error);
      alert('Error fetching order data.');
    });
};

// Function to update Rejection
const handleUpdateRejection = () => {

  const previousSelectedIncompleteBundle = selectedIncompleteBundle;

  let orderUpdateRef;
    if (selectedIncompleteBundle) {
      orderUpdateRef = ref(database, `currentOperations/${selectedLine}/${selectedIncompleteBundle}`);
    } else if (selectedBundle) {
      orderUpdateRef = ref(database, `currentOperations/${selectedLine}/${selectedBundle}`);
    } else {
      console.error("No valid selection made.");
      return;
    }
    setSelectedIncompleteBundle("");
  get(orderUpdateRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const currentData = snapshot.val();
        const currentRejection = currentData['Rejection'] || 0;
        const newRejection= currentRejection + 1;

        // Update the Rejection field
        update(orderUpdateRef, { 'Rejection': newRejection})
          .then(() => {
            console.log(`Rejection updated to ${newRejection}`);
            getCurrentRunTime(selectedLine);
            setSelectedIncompleteBundle(previousSelectedIncompleteBundle);
            countQualities();
          }).then(()=>{
            alert(`Rejection updated to ${newRejection}`);
          })
          .catch((error) => {
            console.error('Error updating Rejection:', error);
            alert('Error updating Rejection.');
          });
      } else {
        alert('No data found for the selected order and bundle.');
      }
    })
    .catch((error) => {
      console.error('Error fetching order data:', error);
      alert('Error fetching order data.');
    });
};


const hasExecutedRunTimeUpdate= useRef(false);
const hasExecutedPauseTimeUpdate = useRef(false);



useEffect(() => {
  if (!selectedLine) {
    console.error("Selected line is undefined or null");
    return;
  }
  
  //console.log("Selected line at start of useEffect: ", selectedLine);

  const timeRef = ref(database, 'serverTime'); // Dummy reference to get server time
  const previousSelectedIncompleteBundle = selectedIncompleteBundle;
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Define the reference for dailyUpdates using the current date and selected line
  const dailyUpdatesRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}`);
  
  // Save server timestamp temporarily to calculate server time
  set(timeRef, {
    timestamp: serverTimestamp(),
  }).then(() => {
   // console.log("Set server timestamp successfully");

    onValue(timeRef, (snapshot) => {
      const serverTime = snapshot.val()?.timestamp;
      if (serverTime) {
        //console.log("Server time received:", serverTime);
        const now = new Date(serverTime);

        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 30, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 30, 0);

        if (now >= start && now <= end) {
          // If there's no startTime, set it to the start time
          if (!startTime) {
            setStartTime(start.getTime());
            localStorage.setItem('startTime', start.getTime());
          }

          // Start the timer
          const intervalId = setInterval(async () => {
            const currentTime = new Date();
            
            // Check if current time is within break periods
            const isBreakTime = (
              (currentTime.getHours() === 10 && currentTime.getMinutes() >= 0 && currentTime.getMinutes() < 15) ||
              (currentTime.getHours() === 15 && currentTime.getMinutes() >= 0 && currentTime.getMinutes() < 15)
            );

            if (isBreakTime && !isBreakTimeModalOpen) {
              setIsBreakTimeModalOpen(true); // Open break time modal
              hasExecutedPauseTimeUpdate.current = false; // Reset for the next break
              
              if (!hasExecutedRunTimeUpdate.current) {
                  getCurrentRunTime(selectedLine); // Call the function to update run time
                  hasExecutedRunTimeUpdate.current = true; // Mark as executed                  
              }
            } else if (!isBreakTime && isBreakTimeModalOpen) {
              setIsBreakTimeModalOpen(false); // Close break time modal
              hasExecutedRunTimeUpdate.current = false; // Reset for the next break
              
              if (!hasExecutedPauseTimeUpdate.current) {
                  updatePauseTime(selectedLine); // Call the function to update pause time
                  hasExecutedPauseTimeUpdate.current = true; // Mark as executed
              }
            }

            // Only update runtime if it's not break time
            if (!isBreakTime) {
              const elapsedTimeInSeconds = Math.floor((Date.now() - startTime) / 1000); // seconds
              const hours = Math.floor(elapsedTimeInSeconds / 3600);
              const minutes = Math.floor((elapsedTimeInSeconds % 3600) / 60);

              const newRunTime = { hours, minutes };
              setRunTime(newRunTime);
              localStorage.setItem('runTime', JSON.stringify(newRunTime));
            }
          }, 1000);

          // Clear interval when the component unmounts or when time ends
          return () => clearInterval(intervalId);
        }
      }
    });
  }).catch((error) => {
    console.error("Error setting server time:", error);
  });
}, [isBreakTimeModalOpen, selectedLine]); // Add all dependencies here


useEffect(() => {
  if (!selectedLine) {
    console.error("Selected line is undefined or null");
    return;
  }

  const timeRef = ref(database, 'serverTime'); // Dummy reference to get server time
  const currentDate = new Date().toISOString().split('T')[0];

  // Save server timestamp temporarily to calculate server time
  set(timeRef, { timestamp: serverTimestamp() })
    .then(() => {
      onValue(timeRef, (snapshot) => {
        const serverTime = snapshot.val()?.timestamp;
        if (serverTime) {
          const now = new Date(serverTime);

          // Define break times for each set of lines
          const breakTimes = {
            group1: {
              start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 26, 0), // 13:55
              end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 27, 0), // 13:56
            },
            group2: {
              start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 35, 0), // 13:57
              end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 36, 0), // 13:58
            },
          };

          // Use separate intervals for different groups of lines to avoid conflicts
          if (selectedLine === 'Line 1' || selectedLine === 'Line 2' || selectedLine === 'Line 3') {
            handleLineGroupBreaks(breakTimes.group1, selectedLine);
          } else if (selectedLine === 'Line 4' || selectedLine === 'Line 5' || selectedLine === 'Line 6') {
            handleLineGroupBreaks(breakTimes.group2, selectedLine);
          }
        }
      });
    })
    .catch((error) => {
      console.error("Error setting server time:", error);
    });
}, [isLunchTimeModalOpen,selectedLine]);

// Function to handle the break time logic for a group of lines
const handleLineGroupBreaks = (breakTime, line) => {
  const intervalId = setInterval(() => {
    const currentTime = new Date();
    const isBreakTime = currentTime >= breakTime.start && currentTime <= breakTime.end;

    if (isBreakTime && !isLunchTimeModalOpen) {
      setIsLunchTimeModalOpen(true);
      hasExecutedPauseTimeUpdate.current = false; // Reset for the next break

      if (!hasExecutedRunTimeUpdate.current) {
        getCurrentRunTime(line); // Update run time
        hasExecutedRunTimeUpdate.current = true; // Mark as executed
      }
    } else if (!isBreakTime && isLunchTimeModalOpen) {
      setIsLunchTimeModalOpen(false); // Close break time modal
      hasExecutedRunTimeUpdate.current = false; // Reset for the next break

      if (!hasExecutedPauseTimeUpdate.current) {
        updateLunchPauseTime(line); // Update pause time
        hasExecutedPauseTimeUpdate.current = true; // Mark as executed
      }
    }
  }, 1000);

  // Clear interval when the component unmounts or when the line changes
  return () => clearInterval(intervalId);
};



const updatePauseTime = async (selectedLine) => {
  const currentDate = new Date().toISOString().split('T')[0]; // Get the current date in YYYY-MM-DD format
  const dailyUpdatesRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}`);

  try {
    // Retrieve current pause time from Firebase
    const snapshot = await get(dailyUpdatesRef);
    if(!snapshot.exists()){
      await update(dailyUpdatesRef, {
        pauseTime: 900,
        isPaused: true,
        startTime: serverTimestamp(),
        endTime: serverTimestamp(),
        Smv:"",
        CurrentEffiency: "",
        Incentive:"",
      });
    }else{
      const currentData = snapshot.val();
      const currentPauseTime = currentData?.pauseTime || 0; // Use 0 if pauseTime does not exist

    // Add 15 minutes (15 * 60 * 1000 milliseconds)
    const updatedPauseTime = currentPauseTime + (900);

    // Update Firebase with the new pause time
    await update(dailyUpdatesRef, {
      pauseTime: updatedPauseTime,
      isPaused: false, // Set paused status
      startTime: serverTimestamp(),
      endTime: serverTimestamp(),
      // Add other fields as necessary
    });

    console.log(`Pause time for line ${selectedLine} has been updated to ${updatedPauseTime} milliseconds.`);
    }
    
  } catch (error) {
    console.error("Error updating pause time:", error);
  }
};

const updateLunchPauseTime = async (selectedLine) => {
  const currentDate = new Date().toISOString().split('T')[0]; // Get the current date in YYYY-MM-DD format
  const dailyUpdatesRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}`);

  try {
    // Retrieve current pause time from Firebase
    const snapshot = await get(dailyUpdatesRef);
    if(!snapshot.exists()){
      await update(dailyUpdatesRef, {
        pauseTime: 1800,
        isPaused: true,
        startTime: serverTimestamp(),
        endTime: serverTimestamp(),
        Smv:"",
        CurrentEffiency: "",
        Incentive:"",
      });
    }else{
      const currentData = snapshot.val();
      const currentPauseTime = currentData?.pauseTime || 0; // Use 0 if pauseTime does not exist

    // Add 15 minutes (30 * 60 * 1000 milliseconds)
    const updatedPauseTime = currentPauseTime + (1800);

    // Update Firebase with the new pause time
    await update(dailyUpdatesRef, {
      pauseTime: updatedPauseTime,
      isPaused: false, // Set paused status
      startTime: serverTimestamp(),
      endTime: serverTimestamp(),
      // Add other fields as necessary
    });

    console.log(`Pause time for line ${selectedLine} has been updated to ${updatedPauseTime} milliseconds.`);
    }
  } catch (error) {
    console.error("Error updating pause time:", error);
  }
};

const [effiency, setEffiency] = useState("0");

const calculateTotalWorkTime = async (selectedLine) => {

  const currentDate = new Date().toISOString().split('T')[0];
  const previousSelectedIncompleteBundle = selectedIncompleteBundle;
  setSelectedIncompleteBundle("");
  
  const runtimeRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}/runTime`);
  const effiencyRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}/Effiency`);
  let effiencyData;
  let effiencySnapshot;
  try{
    effiencySnapshot = await get(effiencyRef );
    if(effiencySnapshot.exists()){
      effiencyData = effiencySnapshot.val();
    }
  }catch(error){
    console.error("Error retrieving runtime data:", error);
  }

  let totalWorkTimeinMinitues = 0;
  let totalQuality = 0;
  let effiency = 0;
  let smv;
  let averageEfficiency = 0;
  try {
      const snapshot = await get(runtimeRef);
      if (snapshot.exists()) {
          const runtimeData = snapshot.val();

          let totalWorkTime = 0; 
          // Iterate through all keys in the runtimeData, regardless of the totalMembers number
          Object.keys(runtimeData).forEach((key) => {
            const entry = runtimeData[key];  // Access each entry (e.g., { runTime: 213 })
            
            if (entry && entry.runTime !== undefined) {
                const runtime = entry.runTime;
                const totalMembers = parseInt(key, 10); // Convert key (which is a string) to an integer

                // Calculate work time by multiplying totalMembers by runtime
                totalWorkTime += totalMembers * runtime;
            }
            totalWorkTimeinMinitues = totalWorkTime/60;
            if(effiencySnapshot.exists()){
              let totalWorkTimeSum = 0;
              let totalEfficiencySum = 0;
              let count = 0; // To count the number of efficiency entries

              // Loop through the entries and sum the totalWorkTimeinMinitues and efficiency values
              effiencySnapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                
                // Summing total work time
                if (data.totalWorkTime) {
                  totalWorkTimeSum += data.totalWorkTime;
                }
                
                // Summing efficiency and counting entries
                if (data.effiency) {
                  totalEfficiencySum += data.effiency;
                  count++;
                }
              });
              totalWorkTimeinMinitues= totalWorkTimeinMinitues-totalWorkTimeSum;
              // Calculate the average efficiency
               averageEfficiency = count > 0 ? (totalEfficiencySum / count) : 0;
            }
          });
       
          console.log("Total Work Time (in seconds):", totalWorkTime);
          console.log("minites "+ totalWorkTimeinMinitues)
          //return totalWorkTime;
      } else {
          console.log("No runtime data available for the given date and line");
          return 0;
      }
  } catch (error) {
      console.error("Error retrieving runtime data:", error);
      return 0;
  }

  const firstQualityRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}/total1stQuality`);
  const qualitySnapshot = await get(firstQualityRef);
  if(qualitySnapshot.exists){
    totalQuality= qualitySnapshot.val();
    console.log("1 ;"+totalQuality)
  }else{
    console.log("No 1st Qualities for today yet.")
  }
  
  const smvRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}/Smv`);
  const currentEffiRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}`);

  const smvSnapshot = await get(smvRef);
      if (smvSnapshot.exists()) {
         smv = smvSnapshot.val();
         console.log("smv "+smv)
      }
  
      effiency = (smv*totalQuality)/(totalWorkTimeinMinitues)*100;
      if(averageEfficiency !==0){
        effiency = (effiency + averageEfficiency)/2;
      }
      setEffiency(effiency);
      await update(currentEffiRef, {
        CurrentEffiency: effiency,
      });
      calculateIncentive(selectedLine,effiency);
      setSelectedIncompleteBundle(previousSelectedIncompleteBundle);

      return { totalWorkTimeinMinitues, effiency, totalQuality };

}

const saveEffiency= async (selectedLine, totalWorkTimeinMinitues, effiency, totalQuality) => {
   const currentDate = new Date().toISOString().split('T')[0];

  // const runtimeRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}/runTime`);
  const effiencyRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}/Effiency`);

  // Use push to create a unique entry
  await push(effiencyRef, {
    totalWorkTime: totalWorkTimeinMinitues,
    effiency: effiency,
    timestamp: new Date().toISOString(), // Optionally, you can also save a timestamp
    Quality: totalQuality,
  });

}

const handleCalculateAndSaveEffiency = async (selectedLine) => {
  // Calculate total work time, efficiency, and quality
  const { totalWorkTimeinMinitues, effiency, totalQuality } = await calculateTotalWorkTime(selectedLine);

  // Save the calculated efficiency data
  await saveEffiency(selectedLine, totalWorkTimeinMinitues, effiency, totalQuality);
};

const [incentive, setIncentive] = useState("");

const calculateIncentive = async (selectedLine, efficiency) => {

  const currentDate = new Date().toISOString().split('T')[0];
  const incentiveRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}`);
  
  const previousSelectedIncompleteBundle = selectedIncompleteBundle;
  setSelectedIncompleteBundle("");

  let incentive = 0;

  // Define the efficiency and corresponding incentive values from the table
  const incentiveTable = [
    { minEfficiency: 60, maxEfficiency: 61, amount: 70 },
    { minEfficiency: 61, maxEfficiency: 62, amount: 73 },
    { minEfficiency: 62, maxEfficiency: 63, amount: 77 },
    { minEfficiency: 63, maxEfficiency: 64, amount: 80 },
    { minEfficiency: 64, maxEfficiency: 65, amount: 83 },
    { minEfficiency: 65, maxEfficiency: 66, amount: 91 },
    { minEfficiency: 66, maxEfficiency: 67, amount: 94 },
    { minEfficiency: 67, maxEfficiency: 68, amount: 97 },
    { minEfficiency: 68, maxEfficiency: 69, amount: 101 },
    { minEfficiency: 69, maxEfficiency: 70, amount: 104 },
    { minEfficiency: 70, maxEfficiency: 71, amount: 111 },
    { minEfficiency: 71, maxEfficiency: 72, amount: 114 },
    { minEfficiency: 72, maxEfficiency: 73, amount: 118 },
    { minEfficiency: 73, maxEfficiency: 74, amount: 121 },
    { minEfficiency: 74, maxEfficiency: 75, amount: 125 },
    { minEfficiency: 75, maxEfficiency: 76, amount: 164 },
    { minEfficiency: 76, maxEfficiency: 77, amount: 174 },
    { minEfficiency: 77, maxEfficiency: 78, amount: 184 },
    { minEfficiency: 78, maxEfficiency: 79, amount: 193 },
    { minEfficiency: 79, maxEfficiency: 80, amount: 203 },
    { minEfficiency: 80, maxEfficiency: 81, amount: 224 },
    { minEfficiency: 81, maxEfficiency: 82, amount: 234 },
    { minEfficiency: 82, maxEfficiency: 83, amount: 245 },
    { minEfficiency: 83, maxEfficiency: 84, amount: 255 },
    { minEfficiency: 84, maxEfficiency: 85, amount: 265 },
    { minEfficiency: 85, maxEfficiency: 86, amount: 289 },
    { minEfficiency: 86, maxEfficiency: 87, amount: 300 },
    { minEfficiency: 87, maxEfficiency: 88, amount: 311 },
    { minEfficiency: 88, maxEfficiency: 89, amount: 321 },
    { minEfficiency: 89, maxEfficiency: 90, amount: 332 },
    { minEfficiency: 90, maxEfficiency: 91, amount: 359 },
    { minEfficiency: 91, maxEfficiency: 92, amount: 371 },
    { minEfficiency: 92, maxEfficiency: 93, amount: 382 },
    { minEfficiency: 93, maxEfficiency: 94, amount: 393 },
    { minEfficiency: 94, maxEfficiency: 95, amount: 404 },
    { minEfficiency: 95, maxEfficiency: 96, amount: 415 },
    { minEfficiency: 96, maxEfficiency: 97, amount: 427 },
    { minEfficiency: 97, maxEfficiency: 98, amount: 438 },
    { minEfficiency: 98, maxEfficiency: 99, amount: 449 },
    { minEfficiency: 99, maxEfficiency: 100, amount: 460 },
    { minEfficiency: 100, maxEfficiency: 101, amount: 472 },
    { minEfficiency: 101, maxEfficiency: 102, amount: 483 },
    { minEfficiency: 102, maxEfficiency: 103, amount: 496 },
    { minEfficiency: 103, maxEfficiency: 104, amount: 509 },
    { minEfficiency: 104, maxEfficiency: 105, amount: 521 },
    { minEfficiency: 105, maxEfficiency: 106, amount: 534 },
    { minEfficiency: 106, maxEfficiency: 107, amount: 546 },
    { minEfficiency: 107, maxEfficiency: 108, amount: 559 },
    { minEfficiency: 108, maxEfficiency: 109, amount: 571 },
    { minEfficiency: 109, maxEfficiency: 110, amount: 584 },
    { minEfficiency: 110, maxEfficiency: 111, amount: 597 },
  ];

  // Check if the efficiency is above 111
  if (efficiency >= 111) {
    incentive = 597; // Set to the max value for efficiencies >= 111
    setIncentive(incentive);
  } else {
    // Find the incentive based on the efficiency range
    const entry = incentiveTable.find(
      item => efficiency >= item.minEfficiency && efficiency < item.maxEfficiency
    );

    if (entry) {
      incentive = entry.amount;
      setIncentive(incentive);
    } else {
      console.log('Efficiency out of range');
      setIncentive("");
    }
  }
  await update(incentiveRef, {
    Incentive: incentive,
  });
  setSelectedIncompleteBundle(previousSelectedIncompleteBundle);
  return incentive;
};


//const [startTime, setStartTime] = useState(null);
 const [runTime, setRunTime] = useState({ hours: 0, minutes: 0 });

// // Simulate server time
 const [serverTime, setServerTime] = useState(new Date());
 const [startTime, setStartTime] = useState(new Date().setHours(7, 30, 0, 0)); // 7:30 AM
const endTime = new Date().setHours(17, 30, 0, 0); // 5:30 PM


//run the server time
useEffect(() => {
  // Simulate getting server time
  setServerTime(new Date());

  // Update the server time every second
  const intervalId = setInterval(() => {
    setServerTime((prevTime) => {
      if (prevTime) {
        return new Date(prevTime.getTime() + 1000); // Increment the time by 1 second
      }
      return null;
    });
  }, 1000);

  // Cleanup interval on component unmount
  return () => clearInterval(intervalId);
}, []);

const [bundles, setBundles] = useState([]);
const [selectedBundle, setSelectedBundle] = useState(""); // Track the selected bundle
const [bundleData, setBundleData] = useState(null); 
  // Function to fetch bundles based on the selected line
  useEffect(() => {

  const inqueueRef = ref(database, `Inqueue/${selectedLine}`);
  const operationsRef = ref(database, `currentOperations/${selectedLine}`);

  // Listen for changes in the selected line's bundles from Inqueue
  const unsubscribe = onValue(inqueueRef, (inqueueSnapshot) => {
    const inqueueData = inqueueSnapshot.val();

    if (inqueueData) {
      const inqueueBundles = Object.keys(inqueueData);

      // Get the bundles in current operations and filter
      get(operationsRef)
        .then((operationsSnapshot) => {
          const operationsData = operationsSnapshot.val();
          const operationsBundles = operationsData ? Object.keys(operationsData) : [];

          // Filter out bundles that are already in current operations
          const filteredBundles = inqueueBundles.filter(
            (bundle) => !operationsBundles.includes(bundle)
          );

          // Set only the bundles that are not in current operations
          setBundles(filteredBundles);
        })
        .catch((error) => {
          console.error('Error fetching current operations data:', error);
          setBundles([]); // Reset if error occurs
        });

    } else {
      setBundles([]); // Reset if no bundles found in Inqueue
    }

    // Reset the selected bundle when the line changes
    setSelectedBundle("");
  });

  // Cleanup listener on component unmount
  return () => unsubscribe();
  }, [selectedLine]);

  const [orderData, setOrderData] = useState(null);

useEffect(() => {
  if (selectedBundle) {
    console.log("Selected bundle:", selectedBundle);
    const bundleRef = ref(database, `Inqueue/${selectedLine}/${selectedBundle}`);
    
    // Retrieve the data of the selected bundle
    onValue(bundleRef, async (snapshot) => {
      const data = snapshot.val();
      console.log("Bundle data:", data); // Log the bundle data
      
      if (data) {
        setBundleData(data); // Store the bundle data
        
        // Extract order details from bundle data
        const { orderNumber, italyPo, productionPo } = data;
        
        if (orderNumber && italyPo && productionPo) {
          // Fetch all orders and filter client-side
          const ordersRef = ref(database, 'orders');
          onValue(ordersRef, (ordersSnapshot) => {
            const ordersData = ordersSnapshot.val();
            //console.log("Orders data:", ordersData); // Log the orders data
            
            let matchingOrder = null;

            if (ordersData) {
              // Loop through orders to find the one that matches all criteria
              for (const orderId in ordersData) {
                const order = ordersData[orderId];
                if (
                  order.orderNumber === orderNumber &&
                  order.italyPO === italyPo &&
                  order.productionPO === productionPo
                ) {
                  matchingOrder = order;
                  break;
                }
              }
            }

            // Set the matched order data
            setOrderData(matchingOrder || null);
          });
        } else {
          setOrderData(null); // Reset if no order details are available
        }
      } else {
        setBundleData(null); // Reset if no bundle data is found
        setOrderData(null);  // Reset the order data if no bundle data found
      }
    });
  }
}, [selectedBundle, selectedLine]);


//incomplete 
const [incompleteBundles, setIncompleteBundles] = useState([]);
const [selectedIncompleteBundle, setSelectedIncompleteBundle] = useState(""); // Track the selected incomplete bundle
const [incompleteBundleData, setIncompleteBundleData] = useState(null); 

// Function to fetch incomplete bundles based on the selected line
useEffect(() => {
  const operationsRef = ref(database, `currentOperations/${selectedLine}`);

  // Listen for changes in the selected line's incomplete bundles
  const unsubscribe = onValue(operationsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const incompleteBundleList = Object.keys(data);
      setIncompleteBundles(incompleteBundleList); // Store the list of incomplete bundles
    } else {
      setIncompleteBundles([]); // Reset if no incomplete bundles found
    }
    // Only reset the selectedIncompleteBundle if the line has changed
    if (selectedLine) {
      setSelectedIncompleteBundle(""); 
    }
  });

  // Cleanup listener on component unmount
  return () => unsubscribe();
}, [selectedLine]);


//const [incompleteOrderData, setIncompleteOrderData] = useState(null); // Store incomplete order data

// Function to load the selected incomplete bundle data from currentOperations node
useEffect(() => {
  if (selectedIncompleteBundle) {
    console.log("Selected incomplete bundle:", selectedIncompleteBundle);
    const incompleteBundleRef = ref(database, `currentOperations/${selectedLine}/${selectedIncompleteBundle}`);
    
    // Retrieve the data of the selected incomplete bundle
    onValue(incompleteBundleRef, (snapshot) => {
      const data = snapshot.val();
      //console.log("Incomplete bundle data:", data); // Log the incomplete bundle data
      
      if (data) {
        setIncompleteBundleData(data); // Store the incomplete bundle data
      } else {
        setIncompleteBundleData(null); // Reset if incomplete bundle has no data
        //setIncompleteOrderData(null);  // Reset the incomplete order data if no bundle data is found
      }
    });
  }
}, [selectedIncompleteBundle, selectedLine]);


const [pendingValue, setPendingValue] = useState(null);

const handleIncompleteBundleChange = (e) => {
  const value = e.target.value;
  setSelectedIncompleteBundle(value);
  setSelectedBundle(""); // Clear the selected bundle when incomplete bundle is chosen
  setOrderData(null)
};

const handleBundleChange = (e) => {
  const value = e.target.value;
  setSelectedBundle(value);
  setSelectedIncompleteBundle(""); // Clear the selected incomplete bundle when a bundle is chosen
  setIncompleteBundleData(null)
};


const countQualities = () => {
 
  let currentOperationsRef;
    if (selectedIncompleteBundle) {
      currentOperationsRef = ref(database, `currentOperations/${selectedLine}/${selectedIncompleteBundle}`);
    } else if (selectedBundle) {
      currentOperationsRef = ref(database, `currentOperations/${selectedLine}/${selectedBundle}`);
    } else {
      console.error("No valid selection made.");
      return;
    }
  //const currentOperationsRef = ref(database, `currentOperations/${selectedLine}/${selectedBundle}`);
  //const inqueueRef = ref(database, `Inqueue/${selectedLine}/${selectedBundle}`);
  let inqueueRef;
    if (selectedIncompleteBundle) {
      inqueueRef = ref(database, `Inqueue/${selectedLine}/${selectedIncompleteBundle}`);
    } else if (selectedBundle) {
      inqueueRef = ref(database, `Inqueue/${selectedLine}/${selectedBundle}`);
    } else {
      console.error("No valid selection made.");
      return;
    }
  get(currentOperationsRef)
    .then((currentSnapshot) => {
      if (currentSnapshot.exists()) {
        const currentFirstQuality = currentSnapshot.val()['1stQuality'] || 0;
        const currentSecondQuality = currentSnapshot.val()['2ndQuality'] || 0;
        const currentRejection = currentSnapshot.val()['Rejection'] || 0;
        const totalBundle = currentSnapshot.val()['noOfPieces'] || 0;

        const pending = totalBundle - currentFirstQuality -currentSecondQuality -currentRejection;
        setPendingValue(pending);  // Set the pending value in state
       }
    })
    .catch((error) => {
      console.error('Error fetching current 1stQuality value:', error);
      alert('Error fetching current 1stQuality value.');
    });
};

useEffect(() => {
  if (pendingValue !== null) {
    // Call the handleCheckPendingAndSave when pendingValue changes
    handleCheckPendingAndSave();
  }
}, [pendingValue]); // Dependency array with pendingValue

const isPendingLessThanThree = () => {
  if (pendingValue === null) return false; // Allow button if pending is null
  return pendingValue < 3;
};

const [isAuthenticated, setIsAuthenticated] = useState(false);
const [authSuccessCallback, setAuthSuccessCallback] = useState(null); // Callback for post-authentication

  // Open modal and set the action to execute after authentication
  const handleOpenPasswordModal = (actionToExecute) => {
    setAuthSuccessCallback(() => actionToExecute); // Set the function to execute after auth
    setIsPasswordModalOpen(true); // Open modal when the Rejection button is clicked
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true); // Mark the user as authenticated
    handleClosePasswordModal(); // Close the modal
    if (authSuccessCallback) {
      authSuccessCallback(); // Execute the passed action after authentication
    }
  };


  // function handleCheckPendingAndSave() {
  //   // Step 1: Check if pending is equal to 0
  //   if (pendingValue === 0) {

  //     let currentOperationsRef;
  
  // // Determine the current operations path based on selected bundle
  // if (selectedIncompleteBundle) {
  //   currentOperationsRef = ref(database, `currentOperations/${selectedLine}/${selectedIncompleteBundle}`);
  // } else if (selectedBundle) {
  //   currentOperationsRef = ref(database, `currentOperations/${selectedLine}/${selectedBundle}`);
  // } else {
  //   console.error("No valid selection made.");
  //   return;
  // }

  // // Step 1: Retrieve data from `currentOperations/{selectedLine}/{selectedBundle}`
  // get(currentOperationsRef)
  //   .then((snapshot) => {
  //     if (!snapshot.exists()) {
  //       throw new Error("Order data not found in currentOperations");
  //     }

  //     const orderData = snapshot.val(); // Get data from currentOperations
      
  //     // Prepare data to be used for updates
  //     const {
  //       italyPo,
  //       productionPO,
  //       styleNumber,
  //       colour,
  //       colourCode,
  //       size,
  //       "1stQuality": newFirstQuality,
  //       "2ndQuality": newSecondQuality,
  //       Rejection: newRejection,
  //     } = orderData;

  //     // Step 2: Check if data exists in Line Operations under `${orderData.orderId}/${orderData.productionPO}`
  //     const lineOperationsRef = ref(database, `Line Operations/${orderData.orderId}/${orderData.productionPO}`);
      
  //     return get(lineOperationsRef).then((lineSnapshot) => {
  //       if (lineSnapshot.exists()) {
  //         const existingData = lineSnapshot.val();

  //         // If data exists, retrieve and update only the quality and rejection values
  //         const updatedFirstQuality = (existingData["1stQuality"] || 0) + (newFirstQuality || 0);
  //         const updatedSecondQuality = (existingData["2ndQuality"] || 0) + (newSecondQuality || 0);
  //         const updatedRejection = (existingData.Rejection || 0) + (newRejection || 0);

  //         // Update the existing data
  //         return set(lineOperationsRef, {
  //           ...existingData, // Keep existing values
  //           "1stQuality": updatedFirstQuality,
  //           "2ndQuality": updatedSecondQuality,
  //           Rejection: updatedRejection,
  //         });
  //       } else {
  //         // If no data exists, set all values as new
  //         return set(lineOperationsRef, {
  //           italyPo,
  //           productionPO,
  //           styleNumber,
  //           colour,
  //           colourCode,
  //           size,
  //           "1stQuality": newFirstQuality || 0,
  //           "2ndQuality": newSecondQuality || 0,
  //           Rejection: newRejection || 0,
  //           OrderStartDate: currentDate
  //         });
  //       }
  //     })
  //   })
    
  //   .then(() => {
  //     console.log("Order data successfully updated in Line Operations and daily runtime updated.");
  //     retrieveOrderData(orderData.orderId,orderData.italyPO,orderData.productionPO);
  //     alert("Bundle completed successfully.");
  //     handleFinish();
  //     remove(currentOperationsRef); // Remove the current operation after completion
  //   })
  //   .catch((error) => {
  //     console.error("Error updating order data or daily runtime:", error);
  //   });
  //   const currentDate = new Date().toISOString().split('T')[0];
  //     // Define the reference for dailyUpdates using the current date and selected line
  //    const dailyUpdatesRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}`);

  //       // Update the dailyUpdatesRef with the new pause time
  //       update(dailyUpdatesRef, {
  //         endTime: serverTimestamp(), // Optionally update the startTime to resume
  //         isPaused: true,
  //       })
  //         .then(() => {
  //           console.log('Pause time calculated and updated successfully.');
  //           //setSelectedIncompleteBundle(previousSelectedIncompleteBundle);
  //         })
  //         .catch((error) => {
  //           console.error('Error updating pause time:', error);
  //         });   
  //   } else {
  //     console.log("Pending is not 0, no action taken.");
  //   }
  // }

  async function handleCheckPendingAndSave() {
    // Step 1: Check if pending is equal to 0
    if (pendingValue === 0) {
      const currentDate = new Date().toISOString().split('T')[0];
      let currentOperationsRef;
  
      // Determine the current operations path based on selected bundle
      if (selectedIncompleteBundle) {
        currentOperationsRef = ref(database, `currentOperations/${selectedLine}/${selectedIncompleteBundle}`);
      } else if (selectedBundle) {
        currentOperationsRef = ref(database, `currentOperations/${selectedLine}/${selectedBundle}`);
      } else {
        console.error("No valid selection made.");
        return;
      }
      let inqueueRef;
      if (selectedIncompleteBundle) {
        inqueueRef = ref(database, `Inqueue/${selectedLine}/${selectedIncompleteBundle}`);
      } else if (selectedBundle) {
        inqueueRef = ref(database, `Inqueue/${selectedLine}/${selectedBundle}`);
      } else {
        console.error("No valid selection made.");
        return;
      }
  
      try {
        // Step 2: Retrieve data from `currentOperations/{selectedLine}/{selectedBundle}`
        const snapshot = await get(currentOperationsRef);
        if (!snapshot.exists()) {
          throw new Error("Order data not found in currentOperations");
        }
  
        const orderData = snapshot.val(); // Get data from currentOperations
        const {
          orderId,
          italyPo,
          productionPO,
          styleNumber,
          colour,
          colourCode,
          size,
          "1stQuality": newFirstQuality,
          "2ndQuality": newSecondQuality,
          Rejection: newRejection,
        } = orderData;
  
        // Step 3: Check if data exists in Line Operations under `${orderData.orderId}/${orderData.productionPO}`
        const lineOperationsRef = ref(database, `Line Operations/${orderData.orderId}/${orderData.productionPO}`);
        const lineSnapshot = await get(lineOperationsRef);
  
        if (lineSnapshot.exists()) {
          const existingData = lineSnapshot.val();
  
          // If data exists, retrieve and update only the quality and rejection values
          const updatedFirstQuality = (existingData["1stQuality"] || 0) + (newFirstQuality || 0);
          const updatedSecondQuality = (existingData["2ndQuality"] || 0) + (newSecondQuality || 0);
          const updatedRejection = (existingData.Rejection || 0) + (newRejection || 0);
  
          // Update the existing data
          await set(lineOperationsRef, {
            ...existingData, // Keep existing values
            "1stQuality": updatedFirstQuality,
            "2ndQuality": updatedSecondQuality,
            Rejection: updatedRejection,
          });
        } else {
          // If no data exists, set all values as new
          await set(lineOperationsRef, {
            italyPo,
            productionPO,
            styleNumber,
            colour,
            colourCode,
            size,
            "1stQuality": newFirstQuality || 0,
            "2ndQuality": newSecondQuality || 0,
            Rejection: newRejection || 0,
            OrderStartDate: currentDate,
          });
        }
  
        // Step 4: Update Line Summary
        const lineSummaryRef = ref(database, `Line Summary/${orderData.orderId}/${orderData.productionPO}/${selectedLine}`);
        const summarySnapshot = await get(lineSummaryRef);
  
        if (summarySnapshot.exists()) {
          const summaryData = summarySnapshot.val();
  
          // Update existing values
          const updatedSummaryFirstQuality = (summaryData["1stQuality"] || 0) + (newFirstQuality || 0);
          const updatedSummarySecondQuality = (summaryData["2ndQuality"] || 0) + (newSecondQuality || 0);
          const updatedSummaryRejection = (summaryData.Rejection || 0) + (newRejection || 0);
  
          // Update the existing summary data
          await set(lineSummaryRef, {
            ...summaryData, // Keep existing values
            "1stQuality": updatedSummaryFirstQuality,
            "2ndQuality": updatedSummarySecondQuality,
            Rejection: updatedSummaryRejection,
          });
        } else {
          // If no data exists, set all values as new
          await set(lineSummaryRef, {
            "1stQuality": newFirstQuality || 0,
            "2ndQuality": newSecondQuality || 0,
            Rejection: newRejection || 0,
          });
        }
  
        console.log("Order data successfully updated in Line Operations and daily runtime updated.");
        await retrieveOrderData(orderData.orderId, orderData.italyPo, orderData.productionPO);
        alert("Bundle completed successfully.");
        handleFinish();
        await remove(currentOperationsRef); // Remove the current operation after completion
        await remove(inqueueRef);
        
        // Define the reference for dailyUpdates using the current date and selected line
        const dailyUpdatesRef = ref(database, `dailyUpdates/${currentDate}/${selectedLine}`);
  
        // Update the dailyUpdatesRef with the new pause time
        await update(dailyUpdatesRef, {
          endTime: serverTimestamp(), // Optionally update the startTime to resume
          isPaused: true,
        });
        console.log('Pause time activated.');
        
      } catch (error) {
        console.error("Error updating order data or daily runtime:", error);
      }
    } else {
      console.log("Pending is not 0, no action taken.");
        
    }
  }
  
  
 // const [quantity, setQuantity] = useState("");

  const retrieveOrderData = async (orderNumber, italyPo, productionPo) => {
  let quantity = 0;
  console.log("or"+orderNumber+" ita"+italyPo+"po "+productionPo)
    const orderRef = ref(database, 'orders');
    try {
      const snapshot = await get(orderRef);
      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        // Loop through the orders to find the matching orderNumber
        let orderFound = false;
        for (const orderId in ordersData) {
          const order = ordersData[orderId];
          if (order.orderNumber === orderNumber &&
            order.italyPO === italyPo &&
            order.productionPO === productionPo) {
            // Order found, return the details
            quantity=order.orderQuantity;
            //setQuantity(order.orderQuantity || '0');
            console.log("Matching order found:", order);
            orderFound = true;
            break; // Exit the loop once the order is found
          }
        }
        // If no matching order is found
        if (!orderFound) {
          console.warn('No matching order found.');
          alert('No matching order found for the provided details.');
        }
      } else {
        console.warn('No orders found in the database.');
      }
      //console.log("quntity "+quantity)
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
    try {
      const lineOperationsRef = ref(database, `Line Operations/${orderNumber}/${productionPo}`);
      const completeOperationsRef = ref(database, `Complete Orders/${orderNumber}/${productionPo}`);
      const snapshot = await get(lineOperationsRef);
  
      if (snapshot.exists()) {
        const data = snapshot.val();
        const firstQuality = data['1stQuality'] || 0;
        const secondQuality = data['2ndQuality'] || 0;
        const rejection = data['Rejection'] || 0;

        const quantityNumber = Number(quantity);
        const totalSum = firstQuality + secondQuality + rejection;
        if(quantityNumber<=totalSum){
          const currentDate = new Date();
          const formattedDate = currentDate.toISOString().split('T')[0]; 
          const updatedData = {
            ...data,
            endDate: formattedDate,
          };
  
          // Copy the updated data to Complete Orders node
          await set(completeOperationsRef, updatedData);
          // Remove data from Line Operations node
          await remove(lineOperationsRef);
          console.log("Updated complete orders.")
        }
        return 0;
      } else {
        console.log('No data available');
        return 0;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return 0;
    }
  };

  return (
    <div className="holder">
        <div>
      <Helmet>
        <title>Line Home</title>
      </Helmet>
      <Titlepic />
      <SignOut />

      <div className='welcome'>
      {serverTime ? (
        <div className='dateTime'>
          <table align='center' border='0'><tr>
          <th><p>Date: {serverTime.toLocaleDateString()}</p></th>
          <th width='10px'></th>
          <th><p>Time: {serverTime.toLocaleTimeString()}</p></th>
          </tr></table></div>
      ) : (
        <p>Loading server time...</p>
      )}
      <div >
        <table width='40%' border='0'className='selTbl'>
          <tr>
            <th width='50%'>Select a Line</th>
            <th width='50%'><select className="custom-select1" value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)}>
      <option value="">Choose a Line</option>
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i + 1} value={`Line ${i + 1}`}>
            Line {i + 1}
          </option>
        ))}
      </select></th>
          </tr>
        </table>
      </div>
        <center><h1>Welcome to {selectedLine}</h1></center>
      </div>
      <div className='fullTbl'>
      <div className='lineBundle'>
      <table border='0' align='center'>
    <div>
      <tr>
        <th className='thSel'><h4>Select a Bundle</h4></th>  
        <th><select
        className="custom-select"
  value={selectedBundle}
  onChange={handleBundleChange}
disabled={isStarted}
>
<option value="">Choose a bundle</option> {/* Default option */}
{bundles.length > 0 ? (
  bundles.map((bundle, index) => (
    <option key={index} value={bundle}>
      {bundle}
    </option>
  ))
) : (
  <option value="">No bundles available</option>
)}
</select></th> 
<th width='10px'></th>
<th className='thSel'><h4>Select an Incomplete Bundle</h4></th>   
<th> <select 
      className="custom-select"
        value={selectedIncompleteBundle}
        onChange={handleIncompleteBundleChange }
        disabled={isStarted}
      >
        <option value="">Choose an incomplete bundle</option> {/* Default option */}
        {incompleteBundles.length > 0 ? (
          incompleteBundles.map((bundle, index) => (
            <option key={index} value={bundle}>
              {bundle}
            </option>
          ))
        ) : (
          <option value="">No incomplete bundles available</option>
        )}
      </select></th>      
        
      </tr>
      </div>
      </table>
      
      {/* Display order details in a table */}
      {orderData &&(
        <div>
          <h3>Order Details</h3>
          <table border="1" align='center'>
            <thead>
              <tr>
                <th>Bundle ID</th>
                <th>Order Number</th>
                <th>Italy PO</th>
                <th>Production PO</th>
                <th>Size</th>
                <th>Style Number</th>
                <th>Color</th>
                <th>Color Code</th>
                <th>Bundle Quantity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{selectedBundle}</td>
                <td>{orderData.orderNumber}</td>
                <td>{orderData.italyPO}</td>                
                <td>{orderData.productionPO}</td>
                <td>{orderData.size}</td>
                <td>{orderData.styleNumber}</td>
                <td>{orderData.colour}</td>
                <td>{orderData.colourCode}</td>
                <td>{bundleData.noOfPieces}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

    
      {/* Display operation details in a table */}
      {incompleteBundleData && (
        <div>
          <h2>Order Details</h2>
          <table border="1" align='center'>
            <thead>
              <tr>
                <th>Bundle ID</th>
                <th>Order Number</th>
                <th>Italy PO</th>
                <th>Style Number</th>
                <th>Production PO</th>
                <th>Color</th>
                <th>Color Code</th>
                <th>Quantity</th> 
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{incompleteBundleData.bundleId}</td>
                <td>{incompleteBundleData.orderId}</td>
                <td>{incompleteBundleData.italyPo}</td>
                <td>{incompleteBundleData.styleNumber}</td>
                <td>{incompleteBundleData.productionPO}</td>
                <td>{incompleteBundleData.colour}</td>     
                <td>{incompleteBundleData.colourCode}</td>    
                <td>{(incompleteBundleData.noOfPieces)}</td>             
              </tr>
            </tbody>
          </table>
        </div>
      )}
     
    </div>
       <div>
        <div className='btnTbl'>
        <table align='center' width="80%" border='0'>
          <tr>
            <th className='th1'><button className='addMemLine'onClick={openModal}  disabled={isStarted && !isPaused} >Add members to the line</button></th>
            <th className='th2'><button className='startLine' onClick={handleStart} disabled={ isStarted && !isFinished}>Start</button></th>
            <th className='th2'><button className='pauseLine'
          onClick={handlePauseResume}
          disabled={!isStarted || isFinished}
        >
          {isPaused ? "Resume" : "Pause"}
        </button></th> 
        <th className='th2'> <button className='stopLine'
          onClick={handleFinish}
          disabled={!isStarted || isPaused}
        >
          Stop
        </button></th>         
          </tr>
        </table>
        {/* {isFinished && <p>Time Elapsed: {formatTime(timer)}</p>} */}
      </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
      <div>
      <label htmlFor="idInput">Enter ID:</label>
      <input
        id="idInput"
        type="tel"
        value={id}
        onChange={handleInputChange1}
        pattern="[0-9]*"
        inputMode="numeric"
        placeholder="Enter your ID"
      />
      <button className='addGuest' onClick={updateGuest}>Add memeber to Line</button>
      {/* {employees.length > 0 ? (
        <ul>
          {employees.map((employee) => (
            <li key={employee.employeeNumber}>
              <strong>{employee.fullName}</strong> - {employee.designation}
              <button onClick={updateHost}>Add to Line</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No employees found for this line.</p>
      )} */}
    </div>
      
        <button onClick={closeModal}>Close Modal</button>
      </Modal>

    <div className='insenTbl'>
    <table align='center' border='1'>
      <tr className='eff'>
        <th className='eff1'>{parseFloat(effiency).toFixed(2)} %</th>

        <th className='eff1'>{incentive !== "" ? `Rs ${incentive} /=` : "--.--"}</th>
      </tr>
      <tr>
        <th className='effTxt'>Efficiency</th>

        <th className='effTxt'>Incentive</th>
      </tr>
    </table>
    </div><br></br>
      {data ? (
    <div className='quaTbl'>
      <table border='1' align="center" width="90%">

        <tr className='qu'>
          <th className='th'>{totalFirstQuality}</th>

          <th className='th'>{data.hostMembers ?? 0}</th>
          <th className='th'>{data.guestMembers ?? 0}</th>

          <th className='th'>      <div>
        {firstQuality !== null ? (
          <div>
            {firstQuality}
          </div>
        ) : (
          <p>No 1st Quality value assigned for this order yet.</p>
        )}
      </div></th>
        <th className='th'>{pendingValue}</th>

        </tr>
        <tr>
          <th className='thTot'>      <div>
        {totalFirstQuality !== null ? (
          <p>Total 1st Quality for today </p>
        ) : (
          <p className='error'>No Total 1st Quality data available for today.</p>
        )}
      </div></th>

          <th className='thTot'>Host Members</th>
          <th className='thTot'>Guest Members</th>

          <th className='thTot'>1st Quality</th>
          <th className='thTot'><div>
        {pendingValue !== null ? (
          <div>
            <p>Pending Pieces </p>
          </div>
        ):(
          <p className='error'> No pending data for this order yet.</p>
        )}
      </div></th>
        </tr>
      </table>
    </div>
      ) : (
        <p className='error'>No memebers assigend for this {selectedLine} yet.</p>
      )}
      <table align='center' className='addQuaTbl' border='0'>
        <tr>
          <th><button className="qua"onClick={handleUpdateQuality} disabled={!isStarted || isPaused}>1st Quality +1</button></th>
          <th><button className="qua"onClick={handleUpdateQualityBy3} disabled={!isStarted || isPaused || isPendingLessThanThree()}>1st Quality +3</button></th>
        </tr>
      </table>

      <table align='center' className='rejTbl' border='0'>
        <tr>
          <th width='50%'> 
      <button className="rej"onClick={() => handleOpenPasswordModal(handleUpdateRejection)} disabled={!isStarted || isPaused}>
        Rejection
      </button></th>
          <th > <button className="qua2"onClick={() => handleOpenPasswordModal(handleUpdateSecondQuality)} disabled={!isStarted || isPaused}>
        2nd Quality +1
      </button></th>
        </tr>
      </table>
      
      






      {/* Modal for password authentication */}
      <RejectionModal
        isOpen={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        onAuthSuccess={handleAuthSuccess} // Call success action after authentication
      />
    
      
      <div>
      <BreakTimeModal isOpen={isBreakTimeModalOpen} onClose={() => setIsBreakTimeModalOpen(false)}>
      <h2>Break Time!</h2>
      <p>The break is from 12:37 PM to 12:40 PM and 3:00 PM to 3:15 PM.</p>
      </BreakTimeModal>
      <div>
        <LunchTimeModal isOpen={isLunchTimeModalOpen} onClose={() => setIsLunchTimeModalOpen(false)}>
          <p>The Lunch time is from 12:37 PM to 12:40 PM and 3:00 PM to 3:15 PM.</p>
        </LunchTimeModal>
      </div>

      <div className='workingTbl'>
    <h2>Working Members for {selectedLine}</h2>
    <table border="1" width='90%' align='center'>
      <thead>
        <tr className='workingTblTR'>
          <th>Employee Number</th>
          <th>Employee Name</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {members.length > 0 ? (
          members.map((member) => (
            <tr key={member.employeeNumber}>
              <td>{member.employeeNumber}</td>
              <td>{member.employeeName}</td>
              <td>
                <button className='removeBtn' disabled={isStarted && !isPaused}
                  onClick={() => handleRemoveMember(member.employeeNumber)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3" style={{ textAlign: "center" }}>
              No members assigned to this line.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
  <p>Runtime: {runTime.hours} hours and {runTime.minutes} minutes</p>
    </div>
    </div>
    </div>
    </div>

  );
}
