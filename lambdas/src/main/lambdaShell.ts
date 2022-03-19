import { LambdaRequest } from "./lambdaRequest"

export const startCall = (args: any[], lambda: ((request: LambdaRequest) => any)) =>
{
    if (args.length != 3)
    {
        throw Error(`Invalid start to lambda function.  ${args.length} parameters`)
    }

    internalStartCall(args[0], args[1], args[2], lambda)
}

const internalStartCall = (
    request: LambdaRequest, 
    _: any, 
    callback: ((_1: any,_2: any) => void),
    lambda: ((request: LambdaRequest) => any)
    ): void => {

    let result = lambda(request)
    callback(null, {
        "statusCode": 200,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": JSON.stringify(result)
    })
}