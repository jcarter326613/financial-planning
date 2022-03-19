import { ArgumentsInvalidException } from "../exceptions/argumentsInvalidException"
import { LambdaRequest } from "../lambdaRequest"
import { startCall } from "../lambdaShell"

export const patch_addStockToTrack = (...args: any[]) => startCall(args, instance.addStockToTrack)

interface Response
{
    hello: string
}

export class StockHistoryManagement
{
    public addStockToTrack(request: LambdaRequest): {"hello": string}
    {
        let symbol: string | null = null
        if (request.queryStringParameters != null)
        {
            symbol = request.queryStringParameters["symbol"]
        }
        if (symbol == null) throw new ArgumentsInvalidException("Missing query parameters, 'symbol'")

        return {"hello": "world"}
    }
}

const instance = new StockHistoryManagement()