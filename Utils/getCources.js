const axios = require("axios").default;

async function getCurrencies() {
  const res = await axios
    .get("https://www.cbr-xml-daily.ru/daily_json.js")
    .catch(console.log);

  return CBR_XML_Daily_Ru(res.data);
}

function CBR_XML_Daily_Ru(rates) {
  return {
    USD: format(rates.Valute.USD.Value),
    EUR: format(rates.Valute.EUR.Value),
    KRW: format((1 / rates.Valute.KRW.Value) * 1000),
  };
}

function format(val) {
  return parseFloat(val).toFixed(3).replace(".", ",");
}

module.exports = getCurrencies;
