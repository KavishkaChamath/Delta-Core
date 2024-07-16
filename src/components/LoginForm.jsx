
// import React from 'react';
// import './LoginForm.css'; // Make sure this path is correct based on your project structure

// export const LoginForm = () => {
//   return (
//     <div>
//       {/* Header with photo and gradient background */}
//       <header className="header">
//         <div className="header-content">
//           {/* Adj
          
          
//           ust the image source to a relative path */}
         
//         </div>
//       </header>

//       {/* Login Form */}
//       <div className='wrapper'>
//       <div className="transparent-box">
//         <form action="">
//           <h2>Login</h2>
//           <div className='input-box'>
//             <input type='text' placeholder='Username' required />
//           </div>
//           <div className='input-box'>
//             <input type='password' placeholder='Password' required />
//           </div>
//           {/* Transparent box under username-password section */}
          
//           <div className="remember-forgot">
//             <label>
//               <input type='checkbox' /> Remember me
//             </label>
//             {' '}
//             <a href='#'>Forgot password</a>
//           </div>
//           <button type='submit'>Login</button>
//           <div className="register-link">
//             <p>Don't have an account? <a href='#'>Register</a></p>
//             </div>
          
//         </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// import React, { useState } from 'react';
// import './LoginForm.css'; // Make sure this path is correct based on your project structure
// import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// export const LoginForm = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState(null);
//   const auth = getAuth();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//     } catch (error) {
//       setError(error.message);
//     }
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     try {
//       await createUserWithEmailAndPassword(auth, email, password);
//     } catch (error) {
//       setError(error.message);
//     }
//   };

//   return (
//     <div>
//       {/* Header with photo and gradient background */}
//       <header className="header">
//         <div className="header-content">
//           {/* Adjust the image source to a relative path */}
//         </div>
//       </header>

//       {/* Login Form */}
//       <div className='wrapper'>
//         <div className="transparent-box">
//           <form action="">
//             <h2>Login</h2>
//             <div className='input-box'>
//               <input
//                 type='email'
//                 placeholder='Email'
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>
//             <div className='input-box'>
//               <input
//                 type='password'
//                 placeholder='Password'
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </div>
//             {/* Transparent box under username-password section */}

//             <div className="remember-forgot">
//               <label>
//                 <input type='checkbox' /> Remember me
//               </label>
//               {' '}
//               <a href='#'>Forgot password</a>
//             </div>
//             <button type='submit' onClick={handleLogin}>Login</button>
//             <div className="register-link">
//               <p>Don't have an account? <a href='#' onClick={handleRegister}>Register</a></p>
//             </div>
//             {error && <p style={{ color: 'ed' }}>{error}</p>}
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };


import React, { useState } from 'react';
import { auth } from '../Firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import './LoginForm.css';
import { useNavigate } from 'react-router-dom';

export const LoginForm = () => {

  const navigate = useNavigate();
  const pageHandle = () => navigate('/pages/AdminHome');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('User signed in:', userCredential.user);
        pageHandle();
      })
      .catch((error) => {
        console.error('Error signing in:', error.code, error.message);
      });
  };

  

  return (
    <div>
      {/* Header with photo and gradient background */}
      <header className="header">
        <div className="header-content">
          {/* Adjust the image source to a relative path */}
        </div>
      </header>

      {/* Login Form */}
      <div className='wrapper'>
        <div className="transparent-box">
          <form onSubmit={handleSignIn}>
            <h2>Login</h2>
            <div className='input-box'>
              <input
                type='text'
                placeholder='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className='input-box'>
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
              <label>
                <input type='checkbox' /> Remember me
              </label>
              {' '}
              <a href='#'>Forgot password</a>
            </div>
            <button type="submit">Sign In</button>
            {/* <div className="register-link">
              <p>Don't have an account? <a href='#' onClick={handleRegister}>Register</a></p>
            </div>
            {error && <p style={{ color: 'ed' }}>{error}</p>} */}
          </form>
        </div>
      </div>
    </div>
  );
};




// src/components/SignIn.js
// import React, { useState } from 'react';
// import { auth } from '../Firebase';
// import { signInWithEmailAndPassword } from 'firebase/auth';

// export const LoginForm= () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleSignIn = (e) => {
//     e.preventDefault();
//     signInWithEmailAndPassword(auth, email, password)
//       .then((userCredential) => {
//         console.log('User signed in:', userCredential.user);
//       })
//       .catch((error) => {
//         console.error('Error signing in:', error.code, error.message);
//       });
//   };

//   return (
//     <form onSubmit={handleSignIn}>
//       <input
//         type="email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         placeholder="Email"
//       />
//       <input
//         type="password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         placeholder="Password"
//       />
//       <button type="submit">Sign In</button>
//     </form>
//   );
// };

 
