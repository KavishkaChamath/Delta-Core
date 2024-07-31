import React, { useState, useEffect } from 'react';
import { database } from '../Firebase';
import { ref, onValue } from 'firebase/database';
import Titlepic from './Titlepic';
import SignOut from './SignOut';

const ShowOrder = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    const orderRef = ref(database, 'orders');
    onValue(orderRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const orderList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setOrders(orderList);
        setFilteredOrders(orderList); // Initially display all orders
      }
    });
  }, []);

  const handleSearch = () => {
    const filtered = orders.filter(order =>
      order.orderNumber.includes(searchTerm) || order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  return (
    <div>
      <Titlepic/>
      <SignOut/>
      <h2>Order List</h2>
      <div>
        <input
          type="text"
          placeholder="Search by Order Number or Customer Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {filteredOrders.length > 0 ? (
        <table border="1">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer</th>
              <th>Order Type</th>
              <th>Order Category</th>
              <th>Style Number</th>
              <th>Product Category</th>
              <th>Colour</th>
              <th>Size</th>
              <th>SMV</th>
              <th>Ithaly PO</th>
              <th>Order Quantity</th>
              <th>PSD</th>
              <th>Colour Code</th>
              <th>Production PO</th>
              <th>PED</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.orderNumber}</td>
                <td>{order.customer}</td>
                <td>{order.orderType}</td>
                <td>{order.orderCategory}</td>
                <td>{order.styleNumber}</td>
                <td>{order.productCategory}</td>
                <td>{order.colour}</td>
                <td>{order.size}</td>
                <td>{order.smv}</td>
                <td>{order.ithalyPO}</td>
                <td>{order.orderQuantity}</td>
                <td>{order.psd}</td>
                <td>{order.colourCode}</td>
                <td>{order.productionPO}</td>
                <td>{order.ped}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No order data available</p>
      )}
    </div>
  );
};

export default ShowOrder;
