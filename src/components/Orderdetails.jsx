// import React from 'react';
// import './Orderdetails.css'; 



// export const Orderdetails = () => {
//   return (
//     <div>
      
//       {/* Header with photo and gradient background */}
//       <header className="header">
//         <div className="header-content">
//           <h1>Order Details</h1>
//         </div>
//       </header>

//       {/* Order details */}
//       <div className='wrapper'>
//         <div className="transparent-box">
//           <h2>Add Order</h2>
//           <form className='order-form'>
//             <div className='form-group1'>
//               <label>Order Number </label>
//               <input type='text' placeholder='Order Number' required />
//             </div>
//             <div className='form-group1'>
//               <label>Customer </label>
//               <input type='text' placeholder='Customer' required />
//             </div>
//             <div className='form-group1'>
//               <label>Order type  </label>
//               <select required>
//                 <option value=''>Select Designation</option>
//               </select>
//             </div>
//             <div className='form-group1'>
//               <label>Order Category</label>
//               <select required>
//                 <option value=''>Select Designation</option>
//               </select>
//             </div>
//             <div className='form-group1'>
//               <label>Style Number </label>
//               <input type='text' placeholder='Style Number' required />
//             </div>
//             <div className='form-group1'>
//               <label>Product Category</label>
//               <input type='text' placeholder='Product Category' required />
//             </div>
//             <div className='form-group1'>
//               <label>Colour  </label>
//               <input type='text' placeholder='Colour' required />
//             </div>
//             <div className='form-group1'>
//               <label>Size</label>
//               <input type='text' placeholder='Size' required />
//             </div>
//             <div className='form-group1'>
//               <label>SMV</label>
//               <input type='text' placeholder='SMV' required />
//             </div>
//             <div className='form-group1'>
//               <label>Ithaly PO</label>
//               <input type='text' placeholder='Ithaly PO' required />
//             </div>
//             <div className='form-group1'>
//               <label>Order Quantity</label>
//               <input type='text' placeholder='Order Quantity' required />
//             </div>
//             <div className='form-group1'>
//               <label>PSD</label>
//               <input type='text' placeholder='PSD' required />
//             </div>
//             <div className='form-group1'>
//               <label>Colour Code</label>
//               <input type='text' placeholder='Colour Code' required />
//             </div>
//             <div className='form-group1'>
//               <label>Production PO</label>
//               <input type='text' placeholder='Production PO' required />
//             </div>
//             <div className='form-group1'>
//               <label>PED</label>
//                <input type='text' placeholder='PED' required />
//             </div>
//             <button type='submit'>Add</button>
//           </form>
//         </div>
//       </div>
    
//     </div>
//   );
// };

// export default Orderdetails;




import React, { useState } from 'react';
import './Orderdetails.css'; 
import { database } from '../Firebase';
import { ref, push } from 'firebase/database';
import Titlepic from './Titlepic';
import SignOut from './SignOut';

export const Orderdetails = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [customer, setCustomer] = useState('');
  const [orderType, setOrderType] = useState('');
  const [orderCategory, setOrderCategory] = useState('');
  const [styleNumber, setStyleNumber] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [colour, setColour] = useState('');
  const [size, setSize] = useState('');
  const [smv, setSmv] = useState('');
  const [ithalyPO, setIthalyPO] = useState('');
  const [orderQuantity, setOrderQuantity] = useState('');
  const [colourCode, setColourCode] = useState('');
  const [productionPO, setProductionPO] = useState('');
  const [psd, setPsd] = useState('');
  const [ped, setPed] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderRef = ref(database, 'orders');
    const newOrder = {
      orderNumber,
      customer,
      orderType,
      orderCategory,
      styleNumber,
      productCategory,
      colour,
      size,
      smv,
      ithalyPO,
      orderQuantity,
      colourCode,
      productionPO,
      psd,
      ped
    };
    push(orderRef, newOrder)
      .then(() => {
        console.log('Order added successfully');
        // Optionally, reset the form
        setOrderNumber('');
        setCustomer('');
        setOrderType('');
        setOrderCategory('');
        setStyleNumber('');
        setProductCategory('');
        setColour('');
        setSize('');
        setSmv('');
        setIthalyPO('');
        setOrderQuantity('');
        setColourCode('');
        setProductionPO('');
        setPsd('');
        setPed('');
      })
      .catch((error) => {
        console.error('Error adding order: ', error);
      });
  };

  return (
    <div>
      <Titlepic/>
      <SignOut/>
      {/* Header with photo and gradient background */}


      {/* Order details */}
      <div className='holder'>
      <div className='wrapper'>
        <div className="transparent-box">
          <h2>Add Order</h2>
          <form className='order-form' onSubmit={handleSubmit}>
            <div className='form-group1'>
              <label>Order Number</label>
              <input type='text' placeholder='Order Number' value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>Customer</label>
              <input type='text' placeholder='Customer' value={customer}
                onChange={(e) => setCustomer(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>Order Type</label>
              <select value={orderType} onChange={(e) => setOrderType(e.target.value)} required>
                <option value=''>Select Order Type</option>
                <option value='Omega Line'>Omega Line</option>
                {/* Add options as needed */}
              </select>
            </div>
            <div className='form-group1'>
              <label>Order Category</label>
              <select value={orderCategory} onChange={(e) => setOrderCategory(e.target.value)} required>
                <option value=''>Select Order Category</option>
                <option value='category'>category</option>
                {/* Add options as needed */}
              </select>
            </div>
            <div className='form-group1'>
              <label>Style Number</label>
              <input type='text' placeholder='Style Number' value={styleNumber}
                onChange={(e) => setStyleNumber(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>Product Category</label>
              <input type='text' placeholder='Product Category' value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>Colour</label>
              <input type='text' placeholder='Colour' value={colour}
                onChange={(e) => setColour(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>Size</label>
              <input type='text' placeholder='Size' value={size}
                onChange={(e) => setSize(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>SMV</label>
              <input type='text' placeholder='SMV' value={smv}
                onChange={(e) => setSmv(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>Ithaly PO</label>
              <input type='text' placeholder='Ithaly PO' value={ithalyPO}
                onChange={(e) => setIthalyPO(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>Order Quantity</label>
              <input type='text' placeholder='Order Quantity' value={orderQuantity}
                onChange={(e) => setOrderQuantity(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>Colour Code</label>
              <input type='text' placeholder='Colour Code' value={colourCode}
                onChange={(e) => setColourCode(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>Production PO</label>
              <input type='text' placeholder='Production PO' value={productionPO}
                onChange={(e) => setProductionPO(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>PSD</label>
              <input type='text' placeholder='PSD' value={psd}
                onChange={(e) => setPsd(e.target.value)} required />
            </div>
            <div className='form-group1'>
              <label>PED</label>
              <input type='text' placeholder='PED' value={ped}
                onChange={(e) => setPed(e.target.value)} required />
            </div>
            <button type='submit'>Add</button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Orderdetails;



  