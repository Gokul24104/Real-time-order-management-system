import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchOrderAndProducts = async () => {
      try {
        const res = await axios.get(`/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const enrichedItems = await Promise.all(
          (res.data.items || []).map(async (item) => {
            if (!item.productId) return item;
            try {
              const productRes = await axios.get(`/api/products/${item.productId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              return {
                ...item,
                name: productRes.data.name,
                unitPrice: productRes.data.price
              };
            } catch {
              return { ...item, name: 'Unnamed' };
            }
          })
        );

        setOrder({ ...res.data, items: enrichedItems });
      } catch (err) {
        toast.error('Failed to load order details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndProducts();
  }, [id]);

  if (loading) return <div className="text-center py-10 text-lg">Loading...</div>;
  if (!order) return <div className="text-center py-10 text-red-500">Order not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto bg-white/80 shadow-xl rounded-2xl p-8 border border-gray-200">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center">Order Details</h2>

        <div className="space-y-4 text-sm md:text-base mb-6">
          <DetailRow label="Order ID" value={order.orderID} />
          <DetailRow label="Customer Name" value={order.customerName} />
          <DetailRow label="Order Amount" value={`₹${Number(order.amount || 0).toFixed(2)}`} />
          <DetailRow label="Order Date" value={new Date(order.orderDate).toLocaleString()} />
          <DetailRow
            label="Invoice"
            value={
              <button
                onClick={async () => {
                  try {
                    const res = await axios.get(`/api/orders/${order.orderID}/invoice-url`, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    window.open(res.data, '_blank');
                  } catch (err) {
                    toast.error('Failed to download invoice');
                    console.error(err);
                  }
                }}
                className="text-blue-600 underline hover:text-blue-800"
              >
                Download PDF
              </button>
            }
          />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Ordered Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm md:text-base">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="border px-4 py-2">Product</th>
                  <th className="border px-4 py-2">Quantity</th>
                  <th className="border px-4 py-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{item.name || 'Unnamed'}</td>
                    <td className="border px-4 py-2">{item.quantity ?? 0}</td>
                    <td className="border px-4 py-2">₹{Number(item.unitPrice ?? 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            to="/"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center border-b pb-2">
      <span className="font-medium text-gray-600">{label}:</span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
}
