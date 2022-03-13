import {ClosePrice} from "./closePrice"
import {Parameters} from "./parameters"
import fetch from "node-fetch"
import { AnyAaaaRecord } from "dns"

export class StockDataRetriever
{
    private requestsPerMinute = 5
    private timeBetweenRequestsMs: number
    private nextAllowedRequest: Date | null = null

    constructor()
    {
        this.timeBetweenRequestsMs = (60 / this.requestsPerMinute) * 1000
    }

    public async retrieveDataForSymbol(symbol: string): Promise<Array<ClosePrice>>
    {
        let result: any = await fetch("https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&" +
            `symbol=${symbol}&` +
            `apikey=${Parameters.instance.alphaVantageApiKey}`)
            .then(res => res.json())
            .then(res => res)

        this.updateNextAllowedRequest()

        let timeSeries = result["Weekly Adjusted Time Series"]
        let returnArray: Array<ClosePrice> = []
        for (let date in timeSeries)
        {
            let close: number = parseFloat(timeSeries[date]["5. adjusted close"])
            let dividend: number = parseFloat(timeSeries[date]["7. dividend amount"])

            if (date.length != 10 || close <= 0 || dividend < 0)
            {
                throw new Error(`Bad format for symbol ${symbol}`)
            }

            let newEntry = new ClosePrice(
                new Date(date),
                close,
                dividend)
            returnArray.push(newEntry)
        }
        
        return returnArray
    }

    private updateNextAllowedRequest()
    {
        let now = Date.now()
        this.nextAllowedRequest = new Date(now + this.timeBetweenRequestsMs)
    }
}

class StockDataDto
{

}