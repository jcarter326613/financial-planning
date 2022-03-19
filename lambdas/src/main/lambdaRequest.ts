export interface LambdaRequest<T = undefined>
{
    queryStringParameters: Record<string, string> | undefined
    pathParameters: Record<string, string> | undefined
    body: T | undefined
}