import { ArgumentsInvalidException } from "../exceptions/argumentsInvalidException"
import { Authentication } from "../services/authentication"
import { Database } from "../services/database"
import { LambdaRequest } from "../lambdaRequest"
import { startCall } from "../lambdaShell"

export const patch_addStockToTrack = async (request: any) => startCall(request, instance.addStockToTrack)

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
}

const instance = new StockHistoryManagement()

interface AddStockToTrackResponse
{
    success: boolean
}