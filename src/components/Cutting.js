import React, { useState } from 'react';
import { getDatabase, ref, set } from 'firebase/database';
import firebase from '../Firebase'; // Make sure to import your Firebase configuration
import './Orderdetails.css'; 


const CuttingDetailsForm = () => {
  const [formData, setFormData] = useState({
    OrderNumber: '',
    BundleId: '',
    size: '',
    stylecode: '',
    colour: '',
    colourCode: '',
    productionPo: '',
    ItslyPo: '',
    Date: '',
    lineNumber: '',
    numberOfPieces: '',
    cutNumber: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate that all required fields are filled out
    for (let key in formData) {
      if (!formData[key]) {
        alert(`${key} is required.`);
        return;
      }
    }

    const db = getDatabase();
    const cuttingDetailsRef = ref(db, 'cuttingDetails/' + formData.OrderNumber);

    set(cuttingDetailsRef, formData)
      .then(() => {
        alert('Cutting details submitted successfully!');
        setFormData({
          OrderNumber: '',
          BundleId: '',
          size: '',
          stylecode: '',
          colour: '',
          colourCode: '',
          productionPo: '',
          ItslyPo: '',
          Date: '',
          lineNumber: '',
          numberOfPieces: '',
          cutNumber: '',
        });
      })
      .catch((error) => {
        console.error('Error writing to Firebase', error);
      });
  };

  return (
    <div className='holder'>
        <center><h2> Cutting details</h2></center>
    <form onSubmit={handleSubmit}>
      <div className='cutform'>
        <label>Order Number:</label>
        <input
          type="text"
          name="OrderNumber"
          value={formData.OrderNumber}
          onChange={handleChange}
          maxLength="20"
          required
        />
      </div>
      <div className='cutform'>
        <label>Bundle ID:</label>
        <input
          type="text"
          name="BundleId"
          value={formData.BundleId}
          onChange={handleChange}
          maxLength="20"
          required
        />
      </div>
      <div className='cutform'>
        <label>Size:</label>
        <input
          type="text"
          name="size"
          value={formData.size}
          onChange={handleChange}
          maxLength="20"
          required
        />
      </div>
      <div className='cutform'>
        <label>Style Code:</label>
        <input
          type="text"
          name="stylecode"
          value={formData.stylecode}
          onChange={handleChange}
          maxLength="20"
          required
        />
      </div>
      <div className='cutform'>
        <label>Colour:</label>
        <input
          type="text"
          name="colour"
          value={formData.colour}
          onChange={handleChange}
          maxLength="20"
          required
        />
      </div>
      <div className='cutform'>
        <label>Colour Code:</label>
        <input
          type="text"
          name="colourCode"
          value={formData.colourCode}
          onChange={handleChange}
          maxLength="7"
          required
        />
      </div>
      <div className='cutform'>
        <label>Production PO:</label>
        <input
          type="text"
          name="productionPo"
          value={formData.productionPo}
          onChange={handleChange}
          maxLength="20"
          required
        />
      </div>
      <div className='cutform'>
        <label>Italy PO:</label>
        <input
          type="text"
          name="ItslyPo"
          value={formData.ItslyPo}
          onChange={handleChange}
          maxLength="20"
          required
        />
      </div>
      <div className='cutform'>
        <label>Date:</label>
        <input
          type="date"
          name="Date"
          value={formData.Date}
          onChange={handleChange}
          required
        />
      </div>
      <div className='cutform'>
        <label>Line Number:</label>
        <input
          type="text"
          name="lineNumber"
          value={formData.lineNumber}
          onChange={handleChange}
          required
        />
      </div>
      <div className='cutform'>
        <label>Number of Pieces:</label>
        <input
          type="text"
          name="numberOfPieces"
          value={formData.numberOfPieces}
          onChange={handleChange}
          required
        />
      </div>
      <div className='cutform'>
        <label>Cut Number:</label>
        <input
          type="text"
          name="cutNumber"
          value={formData.cutNumber}
          onChange={handleChange}
          maxLength="20"
          required
        />
      </div>
      <button type="submit">Submit</button>
    </form>
    </div>
  );
};

export default CuttingDetailsForm;
