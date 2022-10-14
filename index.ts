import fetch from "node-fetch";
import { URLSearchParams } from "url";

const FormData = require('form-data');
const jsSHA = require("jssha");

interface IMerchantParams {
  merchant_id: string;
  merchant_key: string;
  merchant_salt: string;
  debug_on?: number;
  no_installment?:  number;
  max_installment?: number;
  timeout_limit?: number;
  test_mode?: number;
  lang?: string;
}

interface ITransactionParams {
  user_ip: string;
  user_name: string;
  user_address: string;
  user_phone: string;
  payment_amount: number;
  user_basket: [[string, string, number][]];
  email: string;
  merchant_oid: string;
  currency: string;
  merchant_ok_url: string;
  merchant_fail_url: string;
}

interface ITokenClaimResponse{
  status: "success" | "failed";
  token?: string;
  reason?: string
}

interface ITokenCallbackResponse{
  merchant_oid: string;
  status: string;
  total_amount: number;
  hash: string;
  failed_reason_code?: number;
  failed_reason_msg?: string;
  test_mode: string;
  payment_type: string;
  currency?: string;
  payment_amount?: number
}

class PayTR {
  merchantParams: IMerchantParams;

  constructor(params: IMerchantParams) {
    this.merchantParams = params;
  }
  /*
    * Calculates HMAC HASH value
    * @param {string} str - a concantanated value of some values belong to user and seller
    * @param {string} str - value of merchant_key
  */
  estimateHash(str: string, key: string) {
    var shaObj = new jsSHA("SHA-256", "TEXT");
    shaObj.setHMACKey(key, "TEXT");
    shaObj.update(str);
    return shaObj.getHMAC("B64");
  }
  /*
    # Claims a token from PayTR with given parameters
    * @param {object} userParams - it contains some user information and basket data
  */
  async getToken(transactionParams: ITransactionParams): Promise<ITokenClaimResponse | Error> {
    const { merchant_id, merchant_key, merchant_salt, no_installment, max_installment,
      debug_on, timeout_limit, test_mode } = this.merchantParams;

    const { user_ip, user_name, user_address, user_phone, merchant_oid,
      email, payment_amount, currency, merchant_ok_url, merchant_fail_url } = transactionParams;

    const user_basket = Buffer.from(JSON.stringify(transactionParams.user_basket)).toString("base64");
    const hash_str = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`;
    const paytr_token = `${hash_str}${merchant_salt}`;
    const token = this.estimateHash(paytr_token, merchant_key);

    const paytr_body = {
      merchant_id, merchant_key, merchant_salt,
      email, payment_amount, merchant_oid, user_name, user_address, user_phone,
      merchant_ok_url, merchant_fail_url, user_basket, user_ip, timeout_limit, debug_on,
      test_mode, no_installment, max_installment, currency, paytr_token: token,
    }

    const formdata = new FormData(paytr_body as any)
    const body = new URLSearchParams(formdata as any)

    return new Promise((resolve, reject) => {
      fetch("https://www.paytr.com/odeme/api/get-token", {
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        }
      }).then((response) => {
        if (response.status !== 200) {
          reject(new Error(response.statusText));
        } else {
          return response.json();
        }
      }).then((body: ITokenClaimResponse) => {
        resolve(body);
      }).catch((error: Error) => {
        reject(new Error(error.message))
      });
    })
  }
  /*
    * Verifies the HMAC HASH value that comes from PayTR, if it is valid call the callback function, otherwise throw an error
    * @param {object} params - value of request body
    * @param {function} callback - a function that will be called if the hash value is valid
  */
  getPost(params: ITokenCallbackResponse, callback: (params: ITokenCallbackResponse) => void) {
    const { merchant_key, merchant_salt } = this.merchantParams;
    const { hash, merchant_oid, status, total_amount } = params;
    const estimatedHash = this.estimateHash(`${merchant_oid}${merchant_salt}${status}${total_amount}`, merchant_key);
    if (hash === estimatedHash) {
      callback(params);
    } else {
      throw new Error("Hash value is not equal.");
    }
  }
};

module.exports = PayTR;
export default PayTR;