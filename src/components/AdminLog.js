import React, { useState } from 'react';
import { auth } from '../Firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import img21 from './Images/img21.png';
import './LoginForm.css';
import { ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { database } from '../Firebase';

export const AdminLog = () => {

  const navigate = useNavigate();
  const pageHandle = () => navigate('/pages/AdminHome');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // const handleSignIn = (e) => {
  //   e.preventDefault();
  //   signInWithEmailAndPassword(auth, email, password)
  //     .then((userCredential) => {
  //       console.log('User signed in:', userCredential.user);
  //       pageHandle();
  //     })
  //     .catch((error) => {
  //       console.error('Error signing in:', error.code, error.message);
  //     });
  // };

  const handleSignIn = (e) => {
    e.preventDefault();

    console.log('Signing in with email:', email);
    
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('User signed in:', user);

        // Query to find the user by email
        const userRef = ref(database, 'users');
        const userQuery = query(userRef, orderByChild('username'), equalTo(email));

        get(userQuery)
          .then((snapshot) => {
            if (snapshot.exists()) {
              let userData = null;
              snapshot.forEach(childSnapshot => {
                userData = childSnapshot.val();
              });
              console.log('User data retrieved:', userData);

              // Check if the occupation is 'Admin'
              if (userData.occupation === 'Admin') {
                console.log('User is an admin:', userData);
                pageHandle(); // Call the pageHandle function to navigate or perform further actions
              } else {
                console.error('User is not an admin');
                // Optionally, you can sign out the user if they are not an admin
                auth.signOut();
                alert('You are not authorized to access this system.');
              }
            } else {
              console.error('No user data found');
              // Optionally, you can sign out the user if no data is found
              auth.signOut();
              alert('No user data found.');
            }
          })
          .catch((error) => {
            console.error('Error fetching user data:', error);
            // Optionally, you can sign out the user in case of an error
            auth.signOut();
            alert('Error fetching user data.');
          });
      })
      .catch((error) => {
        console.error('Error signing in:', error.code, error.message);
        alert(`Error signing in: ${error.message}`);
      });
  };

  return (
    <div>
      {/* Header with photo and gradient background
      <header className="header">
        <div className="header-content">
          {/* Adjust the image source to a relative path */}
        {/* </div>
      // </header> */} 

      {/* Login Form */}
      <div className='wrapper2'>
        <div className="admintransparent-box">
          <form onSubmit={handleSignIn}>
          <center><img src={img21}></img></center>
          <h2>Administration <br/>Login</h2>
            <div className='input-box1'>
              <input
                type='text'
                placeholder='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className='input-box1'>
              <input
                type='password'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {/* Transparent box under username-password section */}

            <div className="remember-forgot">
              {' '}
              <a href='#'>Forgot Password</a>
            </div>
            <button type="submit">Sign In</button>
            {/* <div className="register-link">
              <p>Don't have an account? <a href='#' onClick={handleRegister}>Register</a></p>
            </div>
            {error && <p style={{ color: 'ed' }}>{error}</p>} */}
          </form>
        </div>
        <div className="footer">
        <p>&copy; 2024 Delta Apparels</p>
      </div>
      </div>
    </div>
  );
};