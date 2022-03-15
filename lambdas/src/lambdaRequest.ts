export interface LambdaRequest<T = undefined, Q = Record<string, string>, P = Record<string, string>>
{
    queryStringParameters: Q
    pathParameters: P
    body: T
}