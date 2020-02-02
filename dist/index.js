"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var request = require("request");
var jsSHA = require("jssha");

var PayTR = exports.PayTR = function () {
  function PayTR(params) {
    _classCallCheck(this, PayTR);

    this.tokenParams = params;
  }
  /*
    * HMAC HASH değerini hesaplar
    * @param {string} str - kullanıcı ve satıcı ile ilgili bir çok bilginin bulunduğu birleştirilmiş string veridir
    * @param {string} key - merchant_key değeridir
  */


  _createClass(PayTR, [{
    key: "estimateHash",
    value: function estimateHash(str, key) {
      var shaObj = new jsSHA("SHA-256", "TEXT");
      shaObj.setHMACKey(key, "TEXT");
      shaObj.update(str);
      return shaObj.getHMAC("B64");
    }
    /*
      * PayTR'ye parametrede verilen bilgiler ile token isteğinde bulunan işlevdir
      * @param {object} userParams - kullanıcı ip bilgisi, adı, adresi, telefonu gibi bilgileri içerir
    */

  }, {
    key: "getToken",
    value: async function getToken(userParams) {
      var _tokenParams = this.tokenParams,
          merchant_id = _tokenParams.merchant_id,
          merchant_key = _tokenParams.merchant_key,
          merchant_salt = _tokenParams.merchant_salt,
          no_installment = _tokenParams.no_installment,
          max_installment = _tokenParams.max_installment,
          debug_on = _tokenParams.debug_on,
          timeout_limit = _tokenParams.timeout_limit,
          test_mode = _tokenParams.test_mode;
      var user_ip = userParams.user_ip,
          user_name = userParams.user_name,
          user_address = userParams.user_address,
          user_phone = userParams.user_phone,
          user_basket = userParams.user_basket,
          merchant_oid = userParams.merchant_oid,
          email = userParams.email,
          payment_amount = userParams.payment_amount,
          currency = userParams.currency,
          merchant_ok_url = userParams.merchant_ok_url,
          merchant_fail_url = userParams.merchant_fail_url;

      var user_basket = new Buffer(JSON.stringify(user_basket)).toString("base64");
      var hash_str = "" + merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode;
      var paytr_token = this.estimateHash("" + hash_str + merchant_salt, merchant_key);
      var options = {
        url: 'https://www.paytr.com/odeme/api/get-token',
        formData: {
          merchant_id: merchant_id, user_ip: user_ip, merchant_oid: merchant_oid, email: email, payment_amount: payment_amount, paytr_token: paytr_token,
          user_basket: user_basket, debug_on: debug_on, no_installment: no_installment, max_installment: max_installment, user_name: user_name, user_address: user_address,
          user_phone: user_phone, merchant_ok_url: merchant_ok_url, merchant_fail_url: merchant_fail_url, timeout_limit: timeout_limit, currency: currency, test_mode: test_mode
        }
      };
      var nullValues = Object.entries(options.formData).filter(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            key = _ref2[0],
            value = _ref2[1];

        return [undefined, null, ""].includes(value);
      });
      if (nullValues.length > 0) {
        throw new Error("getToken params cannot includes null, undefined or empty string.");
      }
      return await new Promise(function (res, rej) {
        request.post(options, function (error, response, body) {
          if (error) throw new Error(error);

          var _JSON$parse = JSON.parse(body),
              status = _JSON$parse.status,
              reason = _JSON$parse.reason,
              token = _JSON$parse.token;

          if (status === "failed") {
            rej(reason);
          }
          if (status === "success") {
            res({ token: token });
          }
        });
      });
    }
    /*
      * PayTR'den gelen POST isteğinin HMAC Hash doğruluğunu kontrol der, doğruysa callback çalıştırır, yanlışsa hata döner  
      * @param {object} params - POST body içeriğidir
      * @param {function} callback - HMAC Hash değeri doğru ise POST body içeriğini gönderir
    */

  }, {
    key: "getPost",
    value: function getPost(params, callback) {
      var _tokenParams2 = this.tokenParams,
          merchant_key = _tokenParams2.merchant_key,
          merchant_salt = _tokenParams2.merchant_salt;
      var hash = params.hash,
          merchant_oid = params.merchant_oid,
          status = params.status,
          total_amount = params.total_amount;

      var estimatedHash = this.estimateHash("" + merchant_oid + merchant_salt + status + total_amount, merchant_key);
      if (hash === estimatedHash) {
        callback(params);
      } else {
        throw new Error("Hash value not equal");
      }
    }
  }]);

  return PayTR;
}();

;

module.exports = PayTR;

