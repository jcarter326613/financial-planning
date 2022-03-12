import {ClosePrice} from "./closePrice"
import {Parameters} from "./parameters"
import fetch from "node-fetch"

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
        let result = await fetch("https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&" +
            `symbol=${symbol}&` +
            `apikey=${Parameters.instance.alphaVantageApiKey}`)
            .then(res => res.json())
            .then(res => res)
        
        this.updateNextAllowedRequest()

        return [
            new ClosePrice(new Date(), 1),
            new ClosePrice(new Date(), 1)
        ]
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