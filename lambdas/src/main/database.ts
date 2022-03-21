import * as mongoDB from "mongodb"
import { Secrets } from "./secrets"

export class Database
{
    public static instance: Database = new Database()

    private databaseName = "main"
    private stockHistoryConfigCollectionName = "StockHistoryConfig"
    private stockHistoryConfigCollection: mongoDB.Collection | null = null
    private accountCollectionName = "Account"
    private accountCollection: mongoDB.Collection | null = null
    private isInitialized = false

    constructor()
    {
    }

    public async initialize()
    {
        if(this.isInitialized) return
        this.isInitialized = true
        let client = new mongoDB.MongoClient(Secrets.instance.mongoDbConnectionString)
        await client.connect()
        let db = client.db(this.databaseName)

        // Get the collections
        this.stockHistoryConfigCollection = db.collection(this.stockHistoryConfigCollectionName)
        this.accountCollection = db.collection(this.accountCollectionName)

        // Create the indexes
        await this.stockHistoryConfigCollection?.createIndex({
            "symbol": 1
        }, {
            "unique": true
        })

        await this.accountCollection?.createIndex({
            "username": 1
        }, {
            "unique": true
        })
    }

    public getStockHistoryConfigCollection = () => this.stockHistoryConfigCollection ?? (() => {throw new Error("Did not initialize database")})()
    public getAccountCollection = () => this.accountCollection ?? (() => {throw new Error("Did not initialize database")})()
}