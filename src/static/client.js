window.addEventListener("load", onLoaded);

async function onLoaded() {
  const clientTokenResponse = await fetch("/client-session", {
    method: "post",
    headers: { "Content-Type": "application/json" },
  });
  // const pay_goog = await fetch("/process")
  const { clientToken } = await clientTokenResponse.json();

  console.log("ct", clientToken)

  const primer = new Primer({
    credentials: {
      clientToken, // server.js generated client token
    },
  });
  console.log("pri", primer)
  // update client session
  
  

  // Use `.checkout()` to initialize and render the UI
  await primer.checkout({
    // Specify the selector of the container element
    container: "#checkout-container",

    /**
     * When a payment method is chosen and the customer clicks 'Pay',
     * the payment method is tokenized and you'll receive a token in the
     * `onTokenizeSuccess` callback which you can send to your server
     * to authorize a transaction.
     */

    onTokenizeSuccess(paymentMethod) {
      // update client session
      // Send the payment method token to your server
      return fetch("/authorize", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          {"paymentMethod":paymentMethod,
          "clientToken":clientToken
        }),
      }).then(()=>{
        console.log("done")
      });
    },

    // Other customization options
    transitions: {
      duration: 700,
    },
  });
}
