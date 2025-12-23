import React from "react";

function loadRazorpay(src) {
  return new Promise(resolve => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RazorpayButton() {
  async function handlePayment() {
    const res = await loadRazorpay("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      alert("Razorpay SDK failed to load 😢");
      return;
    }

    // 1️⃣ Create order from Django
    const orderRes = await fetch("http://127.0.0.1:8000/create-order/");
    const { key, order_id, amount } = await orderRes.json();

    const options = {
      key,
      amount,
      currency: "INR",
      name: "PowerForge",
      description: "Solar Analysis Payment",
      order_id,
      handler: async function (response) {
        const verifyRes = await fetch("http://127.0.0.1:8000/verify-payment/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature
          }),
        });

        const verify = await verifyRes.json();

        if (verify.status === "SUCCESS") {
          alert("Payment successful!");
        } else {
          alert("Payment failed!");
        }
      },
      prefill: {
        name: "User",
        email: "user@example.com",
        contact: "9876543210",
      },
      theme: {
        color: "#00eaff",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  }

  return (
    <button onClick={handlePayment} className="pay-btn" style={{ color: "#fff" }}>
      Pay Now ₹500
    </button>
  );
}
