import { LambdaRequest } from "./lambdaRequest"
import { Database } from "./database"
import { Secrets } from "./secrets"

export const startCall = async <T>(request: any, lambda: ((request: LambdaRequest<T>) => any)): Promise<any> =>
{
    await Secrets.instance.initialize()
    await Database.instance.initialize()
    let result = await lambda(request)
    return {
        "statusCode": 200,
        "headers": {
          "Content-Type": "application/json"
        },
        "body": JSON.stringify(result)
    }
}
