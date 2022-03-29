import * as aws from "aws-sdk"

export class Database
{
    public static instance: Database = new Database()

    private stockHistoryConfigCollectionName = "FreeDays_StockHistoryConfig"
    private accountCollectionName = "FreeDays_Account"
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
        let searchableDocument = this.convertToDocument(filter)
        const document = {
            TableName: this.tableName,
            Key: searchableDocument
        }
        console.info(`Finding document: ${JSON.stringify(document)}`)
        const result = await this.db.getItem(document).promise()
        return this.convertFromDocument(result.Item)
    }

    public async insertOne(item: any): Promise<any>
    {
        const insertableItem = this.convertToDocument(item)
        const document = {
            TableName: this.tableName,
            Item: insertableItem
        }
        console.info(`Inserting document: ${JSON.stringify(document)}`)
        return this.db.putItem(document).promise()
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
        console.info(`Updating document: ${JSON.stringify(finalObject)}`)
        return this.db.putItem(finalObject).promise()
    }

    private convertToDocument(obj: any): any
    {
        let insertableItem: any = {}

        for (let key in obj)
        {
            if (typeof obj[key] == "string")
            {
                insertableItem[key] = { S: obj[key] }
            }
            else if (typeof obj[key] == "number")
            {
                insertableItem[key] = { N: obj[key] }
            }
            else
            {
                throw new Error("Can not insert object with unknown variable types")
            }
        }

        return insertableItem
    }

    private convertFromDocument<T>(obj: any): T
    {
        let retVal: any = {}
        for (let key in obj)
        {
            if (obj[key]["S"] != null)
            {
                retVal[key] = obj[key]["S"]
            }
            else if (obj[key]["N"] != null)
            {
                retVal[key] = Number(obj[key]["N"])
            }
            else
            {
                throw new Error(`Can not parse object with variable type ${obj[key]}`)
            }
        }

        return retVal
    }
}

export type ObjectId = string
