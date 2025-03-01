(function() {
  const COINRAILZ_WALLET = "0x37b4b30e4C879b4DAf334C2e4f8D7B7A8E300A64";
  const NOWPAYMENTS_API_KEY = "GTDME1E-KTB4E01-H9BZGVB-6Z3HMN3";
  const API_URL = "https://api.nowpayments.io/v1";

  async function fetchAvailableCryptos() {
    try {
      const response = await fetch(`${API_URL}/currencies`, {
        headers: { "x-api-key": NOWPAYMENTS_API_KEY }
      });
      const data = await response.json();
      return data.currencies || [];
    } catch (error) {
      console.error("Error fetching available cryptocurrencies:", error);
      return [];
    }
  }

  function createPayment(amount, fiatCurrency, cryptoCurrency, callback) {
    fetch(`${API_URL}/invoice`, {
      method: "POST",
      headers: {
        "x-api-key": NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: parseFloat(amount),
        price_currency: fiatCurrency,
        pay_currency: cryptoCurrency,
        payout_address: COINRAILZ_WALLET,
        order_id: "Coinrailz_Order_" + Date.now(),
        ipn_callback_url: "https://coinrailz.com/ipn",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.invoice_url) {
          callback(null, data.invoice_url);
        } else {
          callback("Error generating payment", null);
        }
      })
      .catch((error) => callback(error, null));
  }

  document.addEventListener("DOMContentLoaded", async function () {
    const widgetContainer = document.getElementById("coinrailz-widget");
    if (!widgetContainer) return;

    const cryptos = await fetchAvailableCryptos();
    const cryptoOptions = cryptos.map(crypto => `<option value="${crypto}">${crypto.toUpperCase()}</option>`).join("");

    widgetContainer.innerHTML = `
      <div style="max-width: 450px; margin: auto; padding: 20px; border-radius: 10px; background: #ffffff; color: #000000; font-family: 'Arial', sans-serif; box-shadow: 0 8px 16px rgba(0,0,0,0.3);">
        <h2 style="text-align: center; color: #4a90e2;">Coinrailz On-Ramp</h2>
        <label>Amount</label>
        <input id="coinrailz-amount" type="number" style="width: 100%; padding: 10px; margin-top: 5px; border-radius: 5px; background: #f5f5f5; color: #000000; border: none;" placeholder="Enter amount" />
        <label style="margin-top: 10px; display: block;">Fiat Currency</label>
        <select id="coinrailz-fiat" style="width: 100%; padding: 10px; border-radius: 5px; background: #f5f5f5; color: #000000; border: none;">
          <option value="usd">USD</option>
          <option value="eur">EUR</option>
        </select>
        <label style="margin-top: 10px; display: block;">Crypto Currency</label>
        <select id="coinrailz-crypto" style="width: 100%; padding: 10px; border-radius: 5px; background: #f5f5f5; color: #000000; border: none;">
          ${cryptoOptions}
        </select>
        <button id="coinrailz-buy" style="width: 100%; padding: 12px; background: #4a90e2; color: #ffffff; border: none; border-radius: 5px; margin-top: 15px; font-weight: bold; cursor: pointer; transition: 0.3s;">Proceed to Payment</button>
        <div id="coinrailz-result" style="text-align: center; margin-top: 10px; font-size: 14px; color: #333;"></div>
      </div>
    `;

    document.getElementById("coinrailz-buy").addEventListener("click", function () {
      const amount = document.getElementById("coinrailz-amount").value;
      const fiatCurrency = document.getElementById("coinrailz-fiat").value;
      const cryptoCurrency = document.getElementById("coinrailz-crypto").value;
      
      if (!amount || amount <= 0) {
        document.getElementById("coinrailz-result").innerHTML = "<p style='color: red;'>Please enter a valid amount.</p>";
        return;
      }
      
      document.getElementById("coinrailz-result").innerHTML = "<p>Processing...</p>";
      
      createPayment(amount, fiatCurrency, cryptoCurrency, function (error, paymentUrl) {
        if (error) {
          document.getElementById("coinrailz-result").innerHTML = "<p style='color: red;'>Error: " + error + "</p>";
        } else {
          document.getElementById("coinrailz-result").innerHTML = `<p><a href="${paymentUrl}" target="_blank" style='color: #4a90e2; font-weight: bold;'>Click here to complete payment</a></p>`;
        }
      });
    });
  });
})();
