import { LambdaRequest } from "../lambdaRequest"
import { LambdaResponse } from "../lambdaResponse"

export const patch_addStockToTrack = (request: LambdaRequest): LambdaResponse<Response> => {
    let ret = {
        hello: "World"
    }

    return {
        "statusCode": 200,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": ret
    }
}

interface Response
{
    hello: string
}
