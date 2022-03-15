export interface LambdaResponse<T>
{
    statusCode: number
    headers: Record<string, string>
    body: T
}