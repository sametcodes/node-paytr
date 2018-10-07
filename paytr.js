const request = require("request");
const jsSHA = require("jssha");

export default class PayTR{
  constructor(params){
    this.tokenParams = params;
  }
  /*
    * HMAC HASH değerini hesaplar
    * @param {string} str - kullanıcı ve satıcı ile ilgili bir çok bilginin bulunduğu birleştirilmiş string veridir
    * @param {string} key - merchant_key değeridir
  */
  estimateHash(str, key){
    var shaObj = new jsSHA("SHA-256", "TEXT");
    shaObj.setHMACKey(key, "TEXT");
    shaObj.update(str);
    return shaObj.getHMAC("B64");
  }
  /*
    * PayTR'ye parametrede verilen bilgiler ile token isteğinde bulunan işlevdir
    * @param {object} userParams - kullanıcı ip bilgisi, adı, adresi, telefonu gibi bilgileri içerir
  */
  async getToken(userParams){
    var { user_ip, user_name, user_address, user_phone, user_basket, merchant_oid,
      email, payment_amount, currency } = userParams;
    var user_basket = new Buffer(JSON.stringify(user_basket)).toString("base64");
    const { merchant_id, merchant_key, merchant_salt, no_installment, max_installment,
      debug_on, merchant_ok_url, merchant_fail_url, timeout_limit, test_mode } = this.tokenParams;
    const hash_str = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`;
    const paytr_token = this.estimateHash(`${hash_str}${merchant_salt}`, merchant_key);
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
  /*
    * PayTR'den gelen POST isteğinin HMAC Hash doğruluğunu kontrol der, doğruysa callback çalıştırır, yanlışsa hata döner  
    * @param {object} params - POST body içeriğidir
    * @param {function} callback - HMAC Hash değeri doğru ise POST body içeriğini gönderir
  */
  getPost(params, callback){
    const { merchant_key, merchant_salt } = this.tokenParams;
    const { hash, merchant_oid, status, total_amount}  = params;
    const estimatedHash = this.estimateHash(`${merchant_oid}${merchant_salt}${status}${total_amount}`, merchant_key);
    if(hash === estimatedHash){
      callback(params);
    }else{
      throw new Error("Hash value not equal");
    }
  }
}
