// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getDatabase } from 'firebase/database';

// const firebaseConfig = {
//     apiKey: "AIzaSyC3gMBeYl7pd9Z1CLfacz8iVlaDVYUpEkk",
//     authDomain: "delta-apparels-dee67.firebaseapp.com",
//     projectId: "delta-apparels-dee67",
//     storageBucket: "delta-apparels-dee67.appspot.com",
//     messagingSenderId: "740626810954",
//     appId: "1:740626810954:web:cb7d4b8bd1591e496f3eb3"
// };

// const app = initializeApp(firebaseConfig);

// export const auth = getAuth(app);
// export const database = getDatabase(app);
// export default firebase;

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyC3gMBeYl7pd9Z1CLfacz8iVlaDVYUpEkk",
  authDomain: "delta-apparels-dee67.firebaseapp.com",
  databaseURL: "https://delta-apparels-dee67-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "delta-apparels-dee67",
  storageBucket: "delta-apparels-dee67.appspot.com",
  messagingSenderId: "740626810954",
  appId: "1:740626810954:web:cb7d4b8bd1591e496f3eb3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;
