(function() {
  const COINRAILZ_WALLET = "0x37b4b30e4C879b4DAf334C2e4f8D7B7A8E300A64";
  const NOWPAYMENTS_API_KEY = "GTDME1E-KTB4E01-H9BZGVB-6Z3HMN3";
  const API_URL = "https://api.nowpayments.io/v1/payment";

  async function createPayment(amount, fiatCurrency, cryptoCurrency) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "x-api-key": NOWPAYMENTS_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          price_amount: parseFloat(amount),
          price_currency: fiatCurrency,
          pay_currency: cryptoCurrency,
          payout_address: COINRAILZ_WALLET,
          order_id: "Coinrailz_Order_" + Date.now(),
          ipn_callback_url: "https://coinrailz.com/ipn"
        })
      });

      const data = await response.json();

      if (data.invoice_url) {
        return data.invoice_url;
      } else {
        throw new Error(data.message || "Failed to generate payment URL");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      return null;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const widgetContainer = document.getElementById("coinrailz-widget");
    if (!widgetContainer) return;

    widgetContainer.innerHTML = `
      <div style="max-width: 450px; margin: auto; padding: 20px; border-radius: 10px; background: #121212; color: white; font-family: 'Arial', sans-serif; box-shadow: 0 8px 16px rgba(0,0,0,0.3);">
        <h2 style="text-align: center; color: #ffcc00;">Coinrailz On-Ramp</h2>
        <label>Amount</label>
        <input id="coinrailz-amount" type="number" style="width: 100%; padding: 10px; margin-top: 5px; border-radius: 5px; background: #232323; color: white; border: none;" placeholder="Enter amount" />
        <label style="margin-top: 10px; display: block;">Fiat Currency</label>
        <select id="coinrailz-fiat" style="width: 100%; padding: 10px; border-radius: 5px; background: #232323; color: white; border: none;">
          <option value="usd">USD</option>
          <option value="eur">EUR</option>
        </select>
        <label style="margin-top: 10px; display: block;">Crypto Currency</label>
        <select id="coinrailz-crypto" style="width: 100%; padding: 10px; border-radius: 5px; background: #232323; color: white; border: none;">
          <option value="btc">Bitcoin (BTC)</option>
          <option value="eth">Ethereum (ETH)</option>
        </select>
        <button id="coinrailz-buy" style="width: 100%; padding: 12px; background: #ffcc00; color: #121212; border: none; border-radius: 5px; margin-top: 15px; font-weight: bold; cursor: pointer; transition: 0.3s;">Proceed to Payment</button>
        <div id="coinrailz-result" style="text-align: center; margin-top: 10px; font-size: 14px; color: #bbb;"></div>
      </div>
    `;

    document.getElementById("coinrailz-buy").addEventListener("click", async function () {
      const amount = document.getElementById("coinrailz-amount").value;
      const fiatCurrency = document.getElementById("coinrailz-fiat").value;
      const cryptoCurrency = document.getElementById("coinrailz-crypto").value;

      if (!amount || amount <= 0) {
        document.getElementById("coinrailz-result").innerHTML = "<p style='color: red;'>Please enter a valid amount.</p>";
        return;
      }

      document.getElementById("coinrailz-result").innerHTML = "<p>Processing...</p>";

      const paymentUrl = await createPayment(amount, fiatCurrency, cryptoCurrency);

      if (paymentUrl) {
        document.getElementById("coinrailz-result").innerHTML = `<p><a href="${paymentUrl}" target="_blank" style='color: #ffcc00; font-weight: bold;'>Click here to complete payment</a></p>`;
      } else {
        document.getElementById("coinrailz-result").innerHTML = "<p style='color: red;'>Error generating payment.</p>";
      }
    });
  });
})();
