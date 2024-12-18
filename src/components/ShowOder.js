import React, { useState, useEffect,useContext } from 'react';
import { ref, onValue, remove } from 'firebase/database';
import { database } from '../Firebase';
import { useNavigate } from 'react-router-dom';

import { UserContext } from '../components/UserDetails';

const ShowOrder = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [showActions, setShowActions] = useState(false);

  const navigate = useNavigate();

  const { user } = useContext(UserContext);

//Filter orders when search term changes
useEffect(() => {
  if (searchTerm) {
    const filtered = orders.filter((order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(filtered);
  } else {
    setFilteredOrders(orders);
  }
}, [searchTerm, orders]);
  useEffect(() => {
    const orderRef = ref(database, 'orders');
    onValue(orderRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const orderList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        // Sort orders by date in descending order (newest first)
        const sortedOrders = orderList.sort((a, b) => new Date(b.psd) - new Date(a.psd));
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders); // Initially display all orders
      }
    });
  }, []);

  const navigateHome = ()=>{
    if (user && user.occupation) { // Check if `user` and `occupation` exist
      if (user.occupation === "IT Section") {
        navigate('/pages/ItHome');
      } else if (user.occupation === "Admin") {
        navigate('/pages/Admin');
      } else {
        console.log("User occupation not recognized!");
      }
    } else {
      alert("User data is not available. Please try again.");
    }
  }


  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      // Sort orders by date in descending order (newest first)
      const sortedOrders = [...orders].sort((a, b) => new Date(b.psd) - new Date(a.psd));
      setFilteredOrders(sortedOrders); // Show all orders if search term is empty
      setShowActions(false); // Hide actions column
      alert('Please enter an Order Number or Customer Name to search.');
      return;
    } else {
      const filtered = orders.filter(order =>
        order.orderNumber.includes(searchTerm) || 
        order.customer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      // Sort filtered results by date in descending order (newest first)
      const sortedFiltered = filtered.sort((a, b) => new Date(b.psd) - new Date(a.psd));
      setFilteredOrders(sortedFiltered);
      setShowActions(sortedFiltered.length > 0); // Show actions column only if there are matching results
    }
  };

  const handleEdit = (orderId) => {
    const orderToEdit = filteredOrders.find(order => order.id === orderId);
    navigate('/editOrder', { state: { orderData: orderToEdit } });
  };

  const handleDelete = (orderId) => {
    const confirmed = window.confirm('Are you sure you want to delete this order?');
    if (confirmed) {
      const orderRef = ref(database, `orders/${orderId}`);
      remove(orderRef)
        .then(() => {
          alert('Order deleted successfully');
          const updatedOrders = orders.filter(order => order.id !== orderId);
          setOrders(updatedOrders);
          setFilteredOrders(updatedOrders);
          setShowActions(false); // Hide actions column after deletion if no orders left
        })
        .catch((error) => {
          console.error('Error deleting order:', error);
        });
    }
  };

  const handleAddAnotherSize = () => {
    if (filteredOrders.length > 0) {
      const firstOrder = filteredOrders[0];
      navigate('/addSizeInSameOrder', { state: { orderData: firstOrder } });
    }
  };

  return (
    <div className='ordTable'>
      <button className='homeBtn' onClick={navigateHome}>
              Home
      </button>
      <div>
        <input
          type="text"
          placeholder="Search by Order Number or Customer Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search" onClick={handleSearch}>Search</button>
      </div>
      {filteredOrders.length > 0 ? (
        <>
          <table border="1" align='center'>
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
                <th>Italy PO</th>
                <th>Production PO</th>
                <th>Order Quantity</th>
                <th>PSD</th>
                <th>Colour Code</th>
                <th>PED</th>
                {showActions && <th>Actions</th>} {/* Conditionally render Actions column */}
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
                  <td>{order.italyPO}</td>
                  <td>{order.productionPO}</td>
                  <td>{order.orderQuantity}</td>
                  <td>{order.psd}</td>
                  <td>{order.colourCode}</td>
                  <td>{order.ped}</td>
                  {showActions && (
                    <td width="100px" align='center'>
                      <button className="editOrd"onClick={() => handleEdit(order.id)}>Edit</button>
                      <button className="deleteOrd"onClick={() => handleDelete(order.id)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {showActions && (
            <div>
              <button className="addSize" onClick={handleAddAnotherSize}>Add Another Size</button>
            </div>
          )}
        </>
      ) : (
        <p>No order data available</p>
      )}
    </div>
  );
};

export default ShowOrder;


