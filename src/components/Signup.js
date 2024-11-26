import React, { useState } from 'react';
import { auth, database } from '../Firebase'; // Ensure you have configured and exported Firebase properly
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set,get, child } from 'firebase/database';
import Titlepic from './Titlepic';
import SignOut from './SignOut';
import { Helmet } from 'react-helmet';
import RemoveUser from './Admin/RemoveUser';

export const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [username, setUsername] = useState('');
  const [occupation, setOccupation] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      const dbRef = ref(database);
      const usersSnapshot = await get(child(dbRef, 'users'));
      const usersData = usersSnapshot.exists() ? usersSnapshot.val() : {};

      // Check if the username already exists in the users node
      const usernameExists = Object.values(usersData).some(
        (user) => user.username === email
      );

      if (usernameExists) {
        alert('Username already exists. Please choose a different username.');
        return;
      }

      // If username does not exist, proceed with creating the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User signed up:', user);

      // Write user data to the Realtime Database
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, {
        username: email,
        password: password,
        occupation: occupation,
      });

      console.log('User data added to database');
      setEmail("");
      setOccupation('')
      setPassword("")
      alert('New user added successfully');
    } catch (error) {
      if (error.code === 'auth/weak-password') {
        alert('Password should be at least 6 characters long.');
      } else {
        console.error('Error during user signup or database operation:', error);
        alert('An error occurred while adding the user. Please try again.');
      }
    }
  };

  return (
    <div className='holder'>
      <Helmet>
        <title>Manage Users</title>
      </Helmet>
      <Titlepic/>
      <SignOut/>
    
    <center><h3>Add new user to the system </h3></center>
    
    <form onSubmit={handleSignUp}>
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {/* <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      /> */}
      
      <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                required
              >
                <option value=''>Select Occupation</option> 
                <option value='Admin'>Admin</option>
                <option value='IT Section'>IT Section</option>
                <option value='Line Manager'>Line Manager</option>
              {/* Add options as needed */}
      </select>
      <button className="addUser"type="submit">Add to the system</button>
    </form><br></br>
    <RemoveUser/>
    </div>
  );
};

export default Signup;
