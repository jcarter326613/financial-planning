import * as mongoDB from "mongodb"
import { hasUncaughtExceptionCaptureCallback } from "process"
import {ClosePrice} from "./closePrice"
import {Parameters} from "./parameters"

export class Database
{
    private databaseName = "main"
    private stockHistoryTableName = "StockHistory"
    private collection: mongoDB.Collection | null = null

    constructor()
    {
    }

    public async initialize()
    {
        let client = new mongoDB.MongoClient(Parameters.instance.mongoDbConnectionString)
        await client.connect()
        let db = client.db(this.databaseName)
        this.collection = db.collection(this.stockHistoryTableName)
    }

    public async mergeInPrices(stocks: Array<ClosePrice>, symbol: string)
    {
        let startDate = this.getFirstDate()
        let endDate = this.getLastDate()

        for (let price of stocks)
        {
            if (startDate == null || startDate > price.date ||
                endDate == null || endDate < price.date)
            {
                await this.collection?.insertOne({
                    "symbol": symbol,
                    "date": price.date,
                    "price": price.price,
                    "dividend": price.dividendAmount != 0 ? price.dividendAmount : undefined
                })
            }
        }
    }

    private getFirstDate(): Date | null
    {
        let collection = this.collection
        if (collection == null) {
            throw new Error("collection can not be null")
        }

        //collection.findOne()
        return null
    }

    private getLastDate(): Date | null
    {
        let collection = this.collection
        if (collection == null) {
            throw new Error("collection can not be null")
        }

        //collection.findOne()
        return null
    }
}