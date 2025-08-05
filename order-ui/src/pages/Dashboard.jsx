import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';

// 👇 Paste this directly below the imports
function renderInvoiceStatus(order, uploadStatus, handleDownload) {
  const status = uploadStatus[order.orderID];

  if (status === 'uploading') {
    return (
      <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-1 rounded">
        Uploading...
      </span>
    );
  } else if (status === 'failed') {
    return (
      <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded">
        Upload Failed
      </span>
    );
  } else if (order.invoiceUrl) {
    return (
      <button
        onClick={() => handleDownload(order.orderID)}
        className="text-blue-600 hover:underline text-sm"
      >
        View Invoice
      </button>
    );
  } else {
    return (
      <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded">
        Not available
      </span>
    );
  }
}


export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [uploadStatus, setUploadStatus] = useState({});
  const location = useLocation();
  const orderId = location.state?.orderId;
  const pendingInvoice = location.state?.pendingInvoice;

  const handleDownload = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}/invoice-url`);
      window.open(res.data, "_blank");
    } catch (err) {
      console.error("Failed to fetch invoice URL", err);
    }
  };

  useEffect(() => {
    api.get('/orders')
      .then(res => {
        const response = Array.isArray(res.data) ? res.data : res.data.orders || [];
        setOrders(response);

        if (pendingInvoice && orderId) {
          setUploadStatus(prev => ({ ...prev, [orderId]: 'uploading' }));
          let attempts = 5;
          const pollInvoice = () => {
            api.get(`/orders/${orderId}`).then(res => {
              if (res.data.invoiceUrl) {
                setUploadStatus(prev => ({ ...prev, [orderId]: 'done' }));
                api.get('/orders').then(r => {
                  const updated = Array.isArray(r.data) ? r.data : r.data.orders || [];
                  setOrders(updated);
                });
              } else if (--attempts > 0) {
                setTimeout(pollInvoice, 2000);
              } else {
                setUploadStatus(prev => ({ ...prev, [orderId]: 'failed' }));
              }
            });
          };

          setTimeout(pollInvoice, 2000);
          window.history.replaceState({}, document.title);
        }
      })
      .catch(err => {
        console.error('Error fetching orders:', err);
      });
  }, [orderId, pendingInvoice]);

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800"> Order Dashboard</h1>
          <Link
            to="/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm sm:text-base"
          >
            + Create Order
          </Link>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-700 font-semibold">
                <th className="px-4 py-3">S.No</th>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order, index) => (
                <tr key={order.orderID} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 text-blue-600 hover:underline">
                    <Link to={`/orders/${order.orderID}`}>{order.orderID}</Link>
                  </td>
                  <td className="px-4 py-3">{order.customerName}</td>
                  <td className="px-4 py-3">₹{order.amount?.toFixed(2) ?? 'N/A'}</td>
                  <td className="px-4 py-3">
                    {new Date(order.orderDate).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata'
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {renderInvoiceStatus(order, uploadStatus, handleDownload)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-4">
          {orders.map((order, index) => (
            <div
              key={order.orderID}
              className="border border-gray-200 rounded-lg shadow-sm p-4 bg-white"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-semibold text-gray-700">
                  #{index + 1} - {order.customerName}
                </h2>
                <span className="text-xs text-gray-500">
                  ₹{order.amount?.toFixed(2) ?? 'N/A'}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-1">
                Order ID:{' '}
                <Link
                  to={`/orders/${order.orderID}`}
                  className="text-blue-600 hover:underline"
                >
                  {order.orderID}
                </Link>
              </p>
              <p className="text-xs text-gray-600 mb-1">
                Date:{' '}
                {new Date(order.orderDate).toLocaleString('en-IN', {
                  timeZone: 'Asia/Kolkata'
                })}
              </p>
              <div className="mt-2">
                {renderInvoiceStatus(order, uploadStatus, handleDownload)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Create Button (Mobile Only) */}
      <Link
        to="/create"
        className="fixed bottom-5 right-5 bg-blue-600 text-white rounded-full shadow-lg p-4 sm:hidden hover:bg-blue-700 transition"
      >
        +
      </Link>
    </div>
  );
}

