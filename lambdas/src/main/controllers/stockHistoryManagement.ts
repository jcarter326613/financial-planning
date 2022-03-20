import { ArgumentsInvalidException } from "../exceptions/argumentsInvalidException"
import { Database } from "../database"
import { LambdaRequest } from "../lambdaRequest"
import { startCall } from "../lambdaShell"

export const patch_addStockToTrack = (...args: any[]) => startCall(args, instance.addStockToTrack)

interface Response
{
    hello: string
}

export class StockHistoryManagement
{
    public async addStockToTrack(request: LambdaRequest): Promise<{"success": boolean}>
    {
        console.log("addStockToTrack t1")
        // Validate the input
        let symbol: string | null = null
        if (request.queryStringParameters != null)
        {
            symbol = request.queryStringParameters["symbol"]?.trim()
        }
        if (symbol == null || symbol.length == 0) throw new ArgumentsInvalidException("Missing query parameters, 'symbol'")

        console.log("addStockToTrack t2")
        // Upsert the symbol into the database
        let collection = Database.instance.getStockHistoryConfigCollection()
        console.log("addStockToTrack t3")

        const query = { name: symbol };
        const update = { $set: { name: symbol } };
        const options = { upsert: true };
        collection.updateOne(query, update, options);
        console.log("addStockToTrack t4")

        return {"success": true}
    }
}

const instance = new StockHistoryManagement()