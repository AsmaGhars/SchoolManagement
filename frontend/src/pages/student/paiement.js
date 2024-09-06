import React, { useState } from "react";
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import axios from "axios";
import "../../app/globals.css";
import Navbar from "@/components/Student/Navbar";
import Layout from "@/components/Student/Layout";
import StripeProvider from "@/components/Student/StripeProvider"; 

const PaymentPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const stripe = useStripe();
  const elements = useElements();

  const handlePayment = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token'); 
      const { data } = await axios.post("http://localhost:5000/api/paiements/create", null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: paymentMethod.id,
      });

      if (confirmError) {
        setError(confirmError.message);
        setLoading(false);
        return;
      }

      await axios.post("http://localhost:5000/api/paiements/confirm", {
        paymentIntentId: data.paymentIntentId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Payment successful!");
    } catch (err) {
      setError("Failed to process payment");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Payment Page</h1>
        <form onSubmit={handlePayment} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Card Details</label>
            <CardElement className="mt-2" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 text-white font-semibold rounded-md shadow-lg transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
          {error && <p className="mt-4 text-red-500">{error}</p>}
        </form>
      </div>
    </Layout>
  );
};

const PaymentPageWrapper = () => (
  <StripeProvider>
    <PaymentPage />
  </StripeProvider>
);

export default PaymentPageWrapper;
