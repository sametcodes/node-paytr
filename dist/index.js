"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const url_1 = require("url");
const FormData = require('form-data');
const jsSHA = require("jssha");
class PayTR {
    constructor(params) {
        this.merchantParams = params;
    }
    /*
      * Calculates HMAC HASH value
      * @param {string} str - a concantanated value of some values belong to user and seller
      * @param {string} str - value of merchant_key
    */
    estimateHash(str, key) {
        var shaObj = new jsSHA("SHA-256", "TEXT");
        shaObj.setHMACKey(key, "TEXT");
        shaObj.update(str);
        return shaObj.getHMAC("B64");
    }
    /*
      # Claims a token from PayTR with given parameters
      * @param {object} userParams - it contains some user information and basket data
    */
    getToken(transactionParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const { merchant_id, merchant_key, merchant_salt, no_installment, max_installment, debug_on, timeout_limit, test_mode } = this.merchantParams;
            const { user_ip, user_name, user_address, user_phone, merchant_oid, email, payment_amount, currency, merchant_ok_url, merchant_fail_url } = transactionParams;
            const user_basket = Buffer.from(JSON.stringify(transactionParams.user_basket)).toString("base64");
            const hash_str = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`;
            const paytr_token = `${hash_str}${merchant_salt}`;
            const token = this.estimateHash(paytr_token, merchant_key);
            const paytr_body = {
                merchant_id, merchant_key, merchant_salt,
                email, payment_amount, merchant_oid, user_name, user_address, user_phone,
                merchant_ok_url, merchant_fail_url, user_basket, user_ip, timeout_limit, debug_on,
                test_mode, no_installment, max_installment, currency, paytr_token: token,
            };
            const formdata = new FormData(paytr_body);
            const body = new url_1.URLSearchParams(formdata);
            return new Promise((resolve, reject) => {
                (0, node_fetch_1.default)("https://www.paytr.com/odeme/api/get-token", {
                    method: "POST",
                    body,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    }
                }).then((response) => {
                    if (response.status !== 200) {
                        reject(new Error(response.statusText));
                    }
                    else {
                        return response.json();
                    }
                }).then((body) => {
                    resolve(body);
                }).catch((error) => {
                    reject(new Error(error.message));
                });
            });
        });
    }
    /*
      * Verifies the HMAC HASH value that comes from PayTR, if it is valid call the callback function, otherwise throw an error
      * @param {object} params - value of request body
      * @param {function} callback - a function that will be called if the hash value is valid
    */
    getPost(params, callback) {
        const { merchant_key, merchant_salt } = this.merchantParams;
        const { hash, merchant_oid, status, total_amount } = params;
        const estimatedHash = this.estimateHash(`${merchant_oid}${merchant_salt}${status}${total_amount}`, merchant_key);
        if (hash === estimatedHash) {
            callback(params);
        }
        else {
            throw new Error("Hash value is not equal.");
        }
    }
}
;
module.exports = PayTR;
exports.default = PayTR;
//# sourceMappingURL=index.js.map