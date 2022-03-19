import * as mongoDB from "mongodb"
import { hasUncaughtExceptionCaptureCallback } from "process"
import { Secrets } from "./secrets"

export class Database
{
    public static instance: Database = new Database()

    private databaseName = "main"
    private stockHistoryConfigCollectionName = "StockHistoryConfig"
    private stockHistoryConfigCollection: mongoDB.Collection | null = null

    constructor()
    {
    }

    public async initialize()
    {
        let client = new mongoDB.MongoClient(Secrets.instance.mongoDbConnectionString)
        await client.connect()
        let db = client.db(this.databaseName)

        // Get the collections
        this.stockHistoryConfigCollection = db.collection(this.stockHistoryConfigCollectionName)

        // Create the indexes
        await this.stockHistoryConfigCollection?.createIndex({
            "symbol": 1
        }, {
            "unique": true
        })
    }

    public getStockHistoryConfigCollection = () => this.stockHistoryConfigCollection ?? (() => {throw new Error("Test")})()
}