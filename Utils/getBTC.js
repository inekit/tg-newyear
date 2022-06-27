const fetch = require('node-fetch')

module.exports = async ()=>{
    

    const rates = await ((await fetch('https://api.coincap.io/v2/rates').catch(console.log)).json())

    const rubRate = await ((await fetch('https://cdn.cur.su/api/cbr.json').catch(console.log)).json())
    
    const btcRate = rates?.data?.find(({symbol})=>symbol==='BTC')
        
    console.log(btcRate?.rateUsd * rubRate?.rates?.RUB, btcRate, rubRate?.rates?.RUB)
    return btcRate?.rateUsd * rubRate?.rates?.RUB

}
