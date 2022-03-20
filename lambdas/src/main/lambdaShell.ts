import { LambdaRequest } from "./lambdaRequest"
import { Database } from "./database"
import { Secrets } from "./secrets"

export const startCall = (args: any[], lambda: ((request: LambdaRequest) => any)) =>
{
    if (args.length != 3)
    {
        throw Error(`Invalid start to lambda function.  ${args.length} parameters`)
    }

    return internalStartCall(args[0], args[1], args[2], lambda)
}

const internalStartCall = async (
    request: LambdaRequest, 
    _: any, 
    callback: ((_1: any,_2: any) => void),
    lambda: ((request: LambdaRequest) => any)
    ): Promise<void> => {

    await Secrets.instance.initialize()
    await Database.instance.initialize()
    let result = await lambda(request)
    callback(null, {
        "statusCode": 200,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": JSON.stringify(result)
    })
}