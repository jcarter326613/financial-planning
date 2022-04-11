import { ArgumentsInvalidException } from "../exceptions/argumentsInvalidException"
import { Authentication } from "../services/authentication"
import { Database } from "../services/database"
import { LambdaRequest } from "../lambdaRequest"
import { startCall } from "../lambdaShell"

export const patch_addStockToTrack = async (request: any) => startCall(request, instance.addStockToTrack)
export const get_listStocksToTrack = async (request: any) => startCall(request, instance.listStocksToTrack)

export class StockHistoryManagement
{
    private static stockHistoryConfigCollectionName: string = "FreeDays_SymbolHistoryConfig"

    public async addStockToTrack(request: LambdaRequest): Promise<AddStockToTrackResponse>
    {
        const user = Authentication.instance.getDecodedUserData(request)

        // Validate the input
        let symbol: string | null = null
        if (request.queryStringParameters != null)
        {
            symbol = request.queryStringParameters["symbol"]?.trim()
        }
        if (symbol == null || symbol.length == 0) throw new ArgumentsInvalidException("Missing query parameters, 'symbol'")

        // Upsert the symbol into the database
        const db = Database.instance.getDb()
        const document = {
            TableName: StockHistoryManagement.stockHistoryConfigCollectionName,
            Item: {
                type: {S: "stock"},
                symbol: {S: symbol}
            }
        }
        const result = await db.putItem(document).promise()
        if (result.$response?.error != null)
        {
            const message = JSON.stringify(result.$response.error)
            console.error(`Error inserting stock history config in database: ${message}`)
            throw new Error(message)
        }
        return {"success": true}
    }

    public async listStocksToTrack(_: LambdaRequest): Promise<ListStocksToTrackResponse>
    {
        // Get the list of symbols from the database
        const db = Database.instance.getDb()
        const document = {
            TableName: StockHistoryManagement.stockHistoryConfigCollectionName
        }
        const result = await db.scan(document).promise()
        console.info(`{{"message"="listStocksToTrack scan", "result"="{JSON.stringify(result)}"`)
        if (result?.$response?.error != null || result.Items == null)
        {
            const message = JSON.stringify(result?.$response?.error)
            console.error(`Error inserting stock history config in database: ${message}`)
            throw new Error(message)
        }
        let retVal: Array<string> = []
        for (let item of result.Items)
        {
            const attributeValue = item["symbol"]
            if (attributeValue.S != null)
            {
                retVal.push(attributeValue.S)
            }
        }
        return {symbols: retVal}
    }
}

const instance = new StockHistoryManagement()

interface AddStockToTrackResponse
{
    success: boolean
}

interface ListStocksToTrackResponse
{
    symbols: Array<string>
}