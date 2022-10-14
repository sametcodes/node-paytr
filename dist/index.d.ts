interface IMerchantParams {
    merchant_id: string;
    merchant_key: string;
    merchant_salt: string;
    debug_on?: number;
    no_installment?: number;
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
interface ITokenClaimResponse {
    status: "success" | "failed";
    token?: string;
    reason?: string;
}
interface ITokenCallbackResponse {
    merchant_oid: string;
    status: string;
    total_amount: number;
    hash: string;
    failed_reason_code?: number;
    failed_reason_msg?: string;
    test_mode: string;
    payment_type: string;
    currency?: string;
    payment_amount?: number;
}
declare class PayTR {
    merchantParams: IMerchantParams;
    constructor(params: IMerchantParams);
    estimateHash(str: string, key: string): any;
    getToken(transactionParams: ITransactionParams): Promise<ITokenClaimResponse | Error>;
    getPost(params: ITokenCallbackResponse, callback: (params: ITokenCallbackResponse) => void): void;
}
export default PayTR;
//# sourceMappingURL=index.d.ts.map