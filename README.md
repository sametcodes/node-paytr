> PayTR'nin resmi bir modülü değildir.

Bu modül ile PayTR API tarafına göndereceğiniz istek üzerine **token** alabilir, oluşturacağınız sipariş sonrası gelecek POST isteklerini karşılayabilirsiniz.

React uygulamanız üzerinde [react-paytr](https://www.npmjs.com/package/react-paytr) bileşeni ile birlikte kullanabilirsiniz.

### Yüklemek

`npm install node-paytr`

### Sözde kod

```javascript
...

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

### Parametreler

Değerler hakkında daha fazla bilgi için entegrasyon dökümanınıza göz atın.

| merchant_params       | type
| --------          | -----------
| merchant_id       | string
| merchant_key      | string
| merchant_salt     | string
| debug_on          | boolean
| no_installment    | boolean
| max_installment   | alfanumerik
| timeout_limit      | integer
| test_mode         | integer

| user_params       | type
| --------       | -----------
| user_ip        | string
| user_name      | string
| user_address   | string
| user_phone     | string
| user_basket    | array
| merchant_oid   | alfanumerik
| email          | string
| payment_amount | integer
| currency       | string
| merchant_ok_url   | string
| merchant_fail_url | string

| post_params        | type
| --------       | -----------
| body           | object
| callback       | function
