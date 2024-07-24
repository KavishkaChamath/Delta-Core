import React from 'react';
import './Orderdetails.css'; 
import Test from './Test';

export const Orderdetails = () => {
  return (
    <div>
      
      {/* Header with photo and gradient background */}
      <header className="header">
        <div className="header-content">
          <h1>Order Details</h1>
        </div>
      </header>

      {/* Order details */}
      <div className='form-wrapper'>
        <div className="transparent-box">
          <h2>Add Order</h2>
          <form className='order-form'>
            <div className='form-group'>
              <label>Order Number</label>
              <input type='text' placeholder='Order Number' required />
            </div>
            <div className='form-group'>
              <label>Customer</label>
              <input type='text' placeholder='Customer' required />
            </div>
            <div className='form-group'>
              <label>Order type</label>
              <select required>
                <option value=''>Select Designation</option>
              </select>
            </div>
            <div className='form-group'>
              <label>Order Category</label>
              <select required>
                <option value=''>Select Designation</option>
              </select>
            </div>
            <div className='form-group'>
              <label>Style Number</label>
              <input type='text' placeholder='Style Number' required />
            </div>
            <div className='form-group'>
              <label>Product Category</label>
              <input type='text' placeholder='Product Category' required />
            </div>
            <div className='form-group'>
              <label>Colour</label>
              <input type='text' placeholder='Colour' required />
            </div>
            <div className='form-group'>
              <label>Size</label>
              <input type='text' placeholder='Size' required />
            </div>
            <div className='form-group'>
              <label>SMV</label>
              <input type='text' placeholder='SMV' required />
            </div>
            <div className='form-group'>
              <label>Ithaly PO</label>
              <input type='text' placeholder='Ithaly PO' required />
            </div>
            <div className='form-group'>
              <label>Order Quantity</label>
              <input type='text' placeholder='Order Quantity' required />
            </div>
            <div className='form-group'>
              <label>PSD</label>
              <input type='text' placeholder='PSD' required />
            </div>
            <div className='form-group'>
              <label>Colour Code</label>
              <input type='text' placeholder='Colour Code' required />
            </div>
            <div className='form-group'>
              <label>Production PO</label>
              <input type='text' placeholder='Production PO' required />
            </div>
            <div className='form-group'>
              <label>PED</label>
               <input type='text' placeholder='PED' required />
            </div>
            <button type='submit'>Add</button>
          </form>
        </div>
      </div>
      <Test/>
    </div>
  );
};

export default Orderdetails;











  