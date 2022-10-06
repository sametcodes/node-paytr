> It's not an official package of PayTR.

This package provides to get an iframe token for your payment gateway and receive the POST requests from PayTR to your callback URL.

If you use React on the client-side, check the
[react-paytr](https://www.npmjs.com/package/react-paytr) package.

### Install

`npm install node-paytr`

### Pseudo-code

```javascript
import PayTR from 'node-paytr';

const paytr = new PayTR(merchant_params);

server.express.post('/get_token', (req, res) => {
    const user_params = req.body();
    res.send(paytr.getToken(user_params));
})

server.express.post('/callback', (req, res) => {
  paytr.getPost(req.body, ({merchant_oid, status}) => {
    //...
  });
  res.send("OK");
})
```

### Parameters

Take a look to the official PayTR docs to get more details about parameters.

| merchant_params       | type
| --------          | -----------
| merchant_id       | string
| merchant_key      | string
| merchant_salt     | string
| debug_on          | boolean
| no_installment    | boolean
| max_installment   | alphanumeric
| timeout_limit      | integer
| test_mode         | integer

| user_params       | type
| --------       | -----------
| user_ip        | string
| user_name      | string
| user_address   | string
| user_phone     | string
| user_basket    | array
| merchant_oid   | alphanumeric
| email          | string
| payment_amount | integer
| currency       | string
| merchant_ok_url   | string
| merchant_fail_url | string

| post_params        | type
| --------       | -----------
| body           | object
| callback       | function
