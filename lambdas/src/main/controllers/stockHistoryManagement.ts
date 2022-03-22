import { ArgumentsInvalidException } from "../exceptions/argumentsInvalidException"
import { Database } from "../services/database"
import { LambdaRequest } from "../lambdaRequest"
import { startCall } from "../lambdaShell"

export const patch_addStockToTrack = async (request: any) => startCall(request, instance.addStockToTrack)

export class StockHistoryManagement
{
    public async addStockToTrack(request: LambdaRequest): Promise<{"success": boolean}>
    {
        // Validate the input
        let symbol: string | null = null
        if (request.queryStringParameters != null)
        {
            symbol = request.queryStringParameters["symbol"]?.trim()
        }
        if (symbol == null || symbol.length == 0) throw new ArgumentsInvalidException("Missing query parameters, 'symbol'")

        // Upsert the symbol into the database
        let collection = Database.instance.getStockHistoryConfigCollection()

        const query = { name: symbol };
        const update = { $set: { name: symbol } };
        const options = { upsert: true };
        collection.updateOne(query, update, options);

        return {"success": true}
    }
}

const instance = new StockHistoryManagement()