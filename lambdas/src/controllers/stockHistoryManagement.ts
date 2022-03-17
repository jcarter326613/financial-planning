import { LambdaRequest } from "../lambdaRequest"
import { LambdaResponse } from "../lambdaResponse"

export const patch_addStockToTrack = (request: LambdaRequest, context: any, callback: ((_1: any,_2: any) => void)) => {
    let ret = {
        hello: "World"
    }

    callback(null, {
        "statusCode": 200,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": JSON.stringify(ret)
    })
}

interface Response
{
    hello: string
}
