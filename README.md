> It's not an official package of PayTR.

This package provides to get an iframe token for your payment gateway and receive the POST requests from PayTR to your callback URL.

If you use React on the client-side, check the
[react-paytr](https://www.npmjs.com/package/react-paytr) package.

### Install

`npm install node-paytr`

### Pseudo-code

```javascript
import PayTR from 'node-paytr';
import express from 'express';

const app = express();
app.use(express.json())

const paytr = new PayTR(merchant_params);

app.post('/get_token', (req, res) => {
    const user_params = req.body;
    res.send(paytr.getToken(user_params));
})

app.post('/callback', (req, res) => {
  paytr.getPost(req.body, ({merchant_oid, status}) => {
    // do your db lookups and updates here
  });
  res.send("OK"); // this line notifies PayTR that you got the callback data
})
```

### Parameters

Take a look to the official PayTR docs to get more details about parameters and [type declarations](/dist/index.d.ts).

| Mercant | type
| --------          | -----------
| merchant_id       | string
| merchant_key      | string
| merchant_salt     | string
| debug_on          | 1 or 0 as number
| no_installment    | 1 or 0 as number
| max_installment   | number
| timeout_limit     | number
| test_mode         | 1 or 0 as number
| lang              | string

| Transaction | type
| --------       | -----------
| user_ip        | string
| user_name      | string
| user_address   | string
| user_phone     | string
| payment_amount | integer
| user_basket    | array
| email          | string
| merchant_oid   | string
| currency       | string
| merchant_ok_url   | string
| merchant_fail_url | string

| POST Callback Data | type
| --------       | -----------
| body           | object
| callback       | function
