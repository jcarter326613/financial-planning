import { LambdaRequest } from "../lambdaRequest"
import { startCall } from "../lambdaShell"

export const patch_addStockToTrack = (...args: any[]) => startCall(args, instance.helloWorld)

interface Response
{
    hello: string
}

class StockHistoryManagement
{
    public helloWorld(request: LambdaRequest): {"hello": string}
    {
        return {"hello": "world"}
    }
}

const instance = new StockHistoryManagement()