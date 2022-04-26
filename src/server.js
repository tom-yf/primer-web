// This example is built using express
const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config({ path: "./../dev.env" });

const PORT = 5000;
const API_KEY = "edd227e6-8c36-4b55-bcd4-83fadafe4a8f";
const PRIMER_API_URL = "https://api.sandbox.primer.io";
const productInfo = {
  "itemId": "Logitech-K251",
  "description": "Logitech K251 Headphone set",
  "amount": 52000,
  "quantity": 1
}; 

const emailAddress = "tom.yang@primer.io";
const app = express();

const staticDir = path.join(__dirname, "static");
const checkoutPage = path.join(__dirname, "static", "index.html");

app.use(bodyParser.json());
app.use("/static", express.static(staticDir));

app.get("/", (req, res) => {
  return res.sendFile(checkoutPage);
});

/// start client session

app.post("/client-session", async(req, res)=>{
  const url = `${PRIMER_API_URL}/client-session`;
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": API_KEY,
    },
    body: JSON.stringify({
      "customerId": "customer-123",
      "orderId": "tom-" + new Date(),
      "currencyCode": "SGD",
      "amount": 52000,
      "metadata": {
        "productType": "Gadget"
      },
      "customer": {
        "emailAddress": emailAddress
      },
      "order": {
        "countryCode": "SG",
        "lineItems": [
          productInfo
        ]
      },
      "paymentMethod": {
        "vaultOnSuccess": true
      }
    }),
  });
  const json = await response.json();
  return res.send(json);
})

// when click on payment is here step 2
app.post("/authorize", async (req, res) => {
  const { paymentMethod,clientToken } = req.body;
  console.log("ClientToken: ",clientToken)
  console.log("PaymentMethod Token: ",paymentMethod.token)

  const client_sessopm_url = `${PRIMER_API_URL}/client-session/actions`;
  // make request to client-session to get new values.

  const response2 = await fetch(client_sessopm_url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": API_KEY,
    },
    body: JSON.stringify({
      "clientToken": clientToken,
      "actions": [
        {
          "type": "SELECT_PAYMENT_METHOD",
          "params": {
            "paymentMethodType": "PAYMENT_CARD"
          }
        }
      ]
    }),
  });
 
  const json2 = await response2.json();

// using the above request response and make new request to new endpoint /payments
  const url = `${PRIMER_API_URL}/payments`;

  const orderId = "order-123." + Math.random();

  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": API_KEY,
      "Idempotency-Key": json2.orderId,
    },
    body: JSON.stringify({
      "orderId": json2.orderId,
      "currencyCode": json2.currencyCode,
      "amount": json2.amount,
      "paymentInstrument": {
        token: paymentMethod.token,
      },
  
     
    }),
  });

  const json = await response.json();
  console.log("reponse after payment: ",json)

  return res.send(json);
});


console.log(`Checkout server listening on port ${PORT}.\n\nYou can now view the Checkout in a web browser at http://localhost:${PORT}`);
app.listen(PORT);
