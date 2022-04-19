export interface LoginRequest
{
    username: string
    password: string
}

export interface LoginResponse
{
    accessToken: string | undefined
    accessTokenExpirationMinutes: number | undefined
    refreshToken: string | undefined
    refreshTokenExpirationMinutes: number | undefined
}