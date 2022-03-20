import { LambdaRequest } from "./lambdaRequest"
import { Database } from "./database"
import { Secrets } from "./secrets"

export const startCall = (args: any[], lambda: ((request: LambdaRequest) => any)) =>
{
    console.log("startCall t1")
    if (args.length != 3)
    {
        throw Error(`Invalid start to lambda function.  ${args.length} parameters`)
    }
    console.log("startCall t2")

    internalStartCall(args[0], args[1], args[2], lambda)
}

const internalStartCall = async (
    request: LambdaRequest, 
    _: any, 
    callback: ((_1: any,_2: any) => void),
    lambda: ((request: LambdaRequest) => any)
    ): Promise<any> => {

    console.log("internalStartCall t1")
    await Secrets.instance.initialize()
    await Database.instance.initialize()
    console.log("internalStartCall t2")
    let result = await lambda(request)
    console.log("internalStartCall t3")
    callback(null, {
        "statusCode": 200,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": JSON.stringify(result)
    })
    console.log("internalStartCall t4")
    return {
        "statusCode": 200,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": JSON.stringify(result)
    }
}