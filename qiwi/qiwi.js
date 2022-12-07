const callbackQiwi = require("./api");
const moment = require("moment");

function getContractID(token) {
  const wallet = new callbackQiwi(token.token, token.proxy_login);
  return wallet
    .getAccountInfo()
    .then((data) => {
      return [wallet, data.contractInfo.contractId];
    })
    .catch((err) => {
      console.log(err);
      return [null, "Нельзя получить идентификатор"];
      //throw new Error("Нельзя получить идентификатор" + err);
    });
}

function getCurrency(code) {
  switch (code) {
    case 643:
      return "RUB";
  }
}

async function getBalance(token) {
  if (!token.token) return;

  return await getContractID(token).then(async ([wallet, contractID]) => {
    if (!wallet) return contractID;
    return await wallet
      .getAccounts(contractID)
      .then((res) => {
        return res.accounts.find((x) => x.alias == "qw_wallet_rub")?.balance
          ?.amount;
      })
      .catch((err) => {
        console.log(err);
        return "Нельзя получить баланс в ";
      });
  });
}

async function getHistory(token) {
  return await getContractID(token)
    .then(async ([wallet, res]) => {
      if (!wallet) return res;
      return await wallet
        .getOperationHistory(res, {
          rows: 5,
          operation: "ALL",
        })
        .then((operations) => {
          //console.log(operations.data);

          return operations.data.reverse();
          //bot.sendMessage(chatId, "JSON.stringify(operations)");
        })
        .catch((err) => {
          return "Нельзя получить получить историю";
          //throw new Error("Нельзя получить историю");
        });
    })
    .catch((err) => console.log(err));
}

async function getIncomeHistory(token) {
  const endDate = new Date();
  let startdate = new Date(endDate);
  const durationInMinutes = 30;
  startdate.setMinutes(endDate.getMinutes() - durationInMinutes);
  const formattedDate = moment(startdate).format("YYYY-MM-ddThh:mm:ssZ");

  return await getContractID(token)
    .then(async ([wallet, res]) => {
      if (!wallet) return res;
      return await wallet
        .getOperationHistory(res, {
          rows: 50,
          operation: "IN",
          startDate: formattedDate,
        })
        .then((operations) => {
          return operations.data.reverse();
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
}

async function getLimits(token) {
  if (!token.token) return;

  const wallet = new callbackQiwi(token.token);

  console.log(token.token);

  return await getContractID(token).then(async ([wallet, contractID]) => {
    if (!wallet) return contractID;
    return wallet
      .getOutLimits(contractID)
      .then((log) => {
        console.log(log);
        return log;
      })
      .catch((err) => {
        console.log(err);
        return "Ошибка";
      });
  });
}

async function transact(token, account, sum) {
  if (!token.token) return;

  const wallet = new callbackQiwi(token.token);

  let comission = (await wallet.checkOnlineCommission(account, { amount: sum }))
    .qwCommission.amount;

  if (comission >= sum) {
    return new Error("Комиссия превышает остаток на счете");
  } else
    return await wallet
      .toCard({ amount: sum - comission, comment: "out", account })
      .then((log) => {
        console.log(log);
        return log;
      })
      .catch((err) => {
        console.log(err);
        return err;
      });
}

async function getTransferInfo(token, account, sum, type) {
  const balance = await getBalance(token);

  console.log(balance);

  let comission = 0;

  if (type === "toCard") {
    const wallet = new callbackQiwi(token.token);
    try {
      comission = (await wallet.checkOnlineCommission(account, { amount: sum }))
        ?.qwCommission.amount;
    } catch (e) {
      comission = "Неизвестна ";
    }
  }

  return { balance, comission };
}

async function transactToAnywhere(token, account, sum, type) {
  console.log(123, token);

  if (!token) throw new Error("no token");

  if (type !== "toCard" && type !== "toMobilePhone" && type !== "toWallet")
    throw new Error("wrong type");

  const wallet = new callbackQiwi(token);

  return await wallet[type]({
    amount: sum,
    comment: "out",
    account,
  }).then((log) => {
    console.log(log);
    return log;
  });
}

module.exports = {
  getHistory,
  getBalance,
  transact,
  getContractID,
  getLimits,
  getIncomeHistory,
  transactToAnywhere,
  getTransferInfo,
};
