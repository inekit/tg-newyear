const QiwiBillPaymentsAPI = require("@qiwi/bill-payments-node-js-sdk");
require("dotenv").config();

class Payments {
  constructor() {
    this.publicKey = process.env.QIWI_PUBLIC_KEY;
    this.qiwi = new QiwiBillPaymentsAPI(process.env.QIWI_PRIVATE_KEY);
  }

  async cancelBill(billId, user_id) {
    //await query("DELETE_BILL", billId);
    //await query("RETURN_RESERVED_MONEY", user_id);
    //return this.qiwi.cancelBill(billId).catch((e) => {});
  }

  createBill(type, amount, currency, billId, successUrl) {
    return {
      qiwi: () =>
        this.qiwi.createPaymentForm({
          publicKey: this.publicKey,
          currency,
          amount,
          billId,
          successUrl,
        }),
    }[type]();
  }
}

module.exports = new Payments();
