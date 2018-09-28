const request = require("request");
const jsSHA = require("jssha");

export default class PayTR{
  constructor(params){
    this.tokenParams = params;
  }
  async getToken(userParams){
    var { user_ip, user_name, user_address, user_phone, user_basket, merchant_oid,
      email, payment_amount, currency } = userParams;
    var user_basket = new Buffer(JSON.stringify(user_basket)).toString("base64");
    const {
      merchant_id, merchant_key, merchant_salt, no_installment, max_installment,
      debug_on, merchant_ok_url, merchant_fail_url, timeout_limit, test_mode } = this.tokenParams;
    const hash_str = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`;
    var shaObj = new jsSHA("SHA-256", "TEXT");
    shaObj.setHMACKey(merchant_key, "TEXT");
    shaObj.update(`${hash_str}${merchant_salt}`);
    const paytr_token = shaObj.getHMAC("B64");
    const options = {
      method: "POST",
      uri: 'https://www.paytr.com/odeme/api/get-token',
      formData: {
        merchant_id, user_ip, merchant_oid, email: email, payment_amount, paytr_token,
        user_basket, debug_on, no_installment, max_installment, user_name, user_address,
        user_phone, merchant_ok_url, merchant_fail_url, timeout_limit, currency, test_mode
      }
    };
    return await new Promise((res, rej) => {
      request(options, function (error, response, body) {
        if (error) throw new Error(error);
        const {status, reason, token} = JSON.parse(body);
        if(status === "failed"){
          rej(reason)
        }
        if(status === "success"){
          res({token})
        }
      });
    })
  }
}
