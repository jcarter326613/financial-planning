import { ArgumentsInvalidException } from "./exceptions/argumentsInvalidException"
import { Database } from "./services/database"
import { HttpError } from "./exceptions/httpError"
import { LambdaRequest } from "./lambdaRequest"
import { Secrets } from "./services/secrets"
import * as aws from "aws-sdk"

aws.config.update({
    region: "us-east-1"
});

export const startCall = async <T>(request: any, lambda: ((request: LambdaRequest<T>) => any)): Promise<any> =>
{
    try
    {
        console.info(`Request: ${JSON.stringify(request)}`)
        request.body = JSON.parse(request.body)
        const result = await lambda(request)
        const resultString = JSON.stringify(result)
        console.info(`Returning success: ${resultString}`)
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": resultString
        }
    } 
    catch (e) 
    {
        console.error(`Returning error: ${JSON.stringify(e)}`)
        let code = 500
        let message = "Unknown error"
        if (e instanceof HttpError )
        {
            code = e.statusCode
        }
        else if (e instanceof ArgumentsInvalidException)
        {
            code = 400
        }
        if (e instanceof Error)
        {
            message = e.message
        }
        return {
            "statusCode": code,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify({message: message})
        }
    }
}
