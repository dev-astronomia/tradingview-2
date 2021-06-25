import axios from 'axios'; 
import * as Bitquery from './bitquery';

const lastBarsCache = new Map(); 
const configurationData = {
    supported_resolutions: ['5','15','30','1D', '1W', '1M']
}; 

export default {
    // This method is used by the Charting Library to get a configuration of your datafeed 
    // (e.g. supported resolutions, exchanges and so on)
    onReady: (callback) => {
        console.log('[onReady]: Method called!!');
        setTimeout(() => callback(configurationData));
    },
    // This method is used by the library to retrieve information about a specific symbol 
    // (exchange, price scale, full symbol etc.).
    resolveSymbol: async (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) =>{
        console.log('[resolveSymbol]: Method called!!'); 
        const response = await fetch(Bitquery.endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": "BQYUGuoO6tZKM20I0lfBNCTEC4ouBCT1"
            },
            body: JSON.stringify({
                query: Bitquery.QUERY
            })
        })
        const coin = response.data.data.ethereum.dexTrades[0].baseCurrency; 
        if(!coin){
            onResolveErrorCallback(); 
        }else{
            const symbol = {
                ticker: "0x910985ffa7101bf5801dd2e91555c465efd9aab3",
                name: 'ETH/USD',
                session: '24x7',
                timezone: 'Etc/UTC',
                minmov: 1,
                pricescale: 10000000,
                has_intraday: true,
                intraday_multipliers: ['1', '5', '15', '30', '60'],
                has_empty_bars: true,
                has_weekly_and_monthly: false,
                supported_resolutions: configurationData.supported_resolutions, 
                volume_precision: 1,
                data_status: 'streaming',
            }
            onSymbolResolvedCallback(symbol); 
        }
    }, 
    // This method is used by the charting library to get historical data for the symbol. 
    getBars: async(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, first) =>{
        try{
            if (resolution==='1D') {
                resolution = 1440;
            }
            
            const response = await axios.post(Bitquery.endpoint, {
                query: Bitquery.QUERY,
                variables: {
                    "from": new Date(from*1000).toISOString(),
                    "to": new Date(to*1000).toISOString(),
                    "interval": Number(resolution),
                    "tokenAddress": symbolInfo.ticker
                },
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": "BQYUGuoO6tZKM20I0lfBNCTEC4ouBCT1"
                }
            })

            const bars = response.data.data.ethereum.dexTrades.map(el => ({
                time: new Date(el.timeInterval.minute).getTime(), // date string in api response
                low: el.low,
                high: el.high,
                open: Number(el.open),
                close: Number(el.close),
                volume: el.volume
            }))

            if (bars.length){
                onHistoryCallback(bars, {noData: false}); 
            }else{
                onHistoryCallback(bars, {noData: true}); 
            }

        } catch(error){
            onErrorCallback(error); 
        }
    },

};