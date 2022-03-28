import { Secrets } from "./secrets"
import * as aws from "aws-sdk"
import { hasUncaughtExceptionCaptureCallback } from "process"

export class Database
{
    public static instance: Database = new Database()

    private stockHistoryConfigCollectionName = "StockHistoryConfig"
    private accountCollectionName = "Account"
    private isInitialized = false
    private db: aws.DynamoDB | undefined

    constructor()
    {
    }

    public async initialize()
    {
        if (this.isInitialized) { return }
        this.isInitialized = true
        aws.config.update({
            region: "us-east-1"
        });

        this.db = new aws.DynamoDB({apiVersion: '2012-08-10'})
    }

    public getStockHistoryConfigCollection(): Collection
    {
        if (this.db == null) { throw new Error("Database not initialized") }
        return new Collection(this.stockHistoryConfigCollectionName, this.db)
    }

    public getAccountCollection(): Collection
    {
        if (this.db == null) { throw new Error("Database not initialized") }
        return new Collection(this.accountCollectionName, this.db)
    }
}

export class Collection
{
    private tableName: string
    private db: aws.DynamoDB

    constructor(tableName: string, db: aws.DynamoDB)
    {
        this.tableName = tableName
        this.db = db
    }

    public async findOne<T = any>(filter: any): Promise<T>
    {
        const result = await this.db.getItem(filter).promise()
        return result.Item as unknown as T
    }

    public async insertOne(item: any): Promise<any>
    {
        return this.db.putItem(item).promise()
    }

    public async updateOne(query: any, update: any, options: any): Promise<any>
    {
        if (options.upsert == null || options.upsert != true)
        {
            throw new Error("Can not updateOne without upsert = true")
        }
        if (update["$set"] == null)
        {
            throw new Error("Can update update without $set")
        }
        const finalObject = {
            ...query,
            ...update["$set"]
        }
        return this.db.putItem(finalObject).promise()
    }
}

export type ObjectId = string
