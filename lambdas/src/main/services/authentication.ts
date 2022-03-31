import * as jwt from "jsonwebtoken"
import { LambdaRequest } from "../lambdaRequest"
import { Secrets } from "./secrets"

export class Authentication
{
    public static instance: Authentication = new Authentication()

    public accessTokenExpirationMinutes = 15
    public refreshTokenExpirationMinutes = 30

    public async generateAccessToken(userId: string): Promise<string>
    {
        const accessTokenSecret = await Secrets.instance.getAccessTokenSecret()
        return jwt.sign({userId: userId, type: TokenType.Auth}, accessTokenSecret,
            {expiresIn: `${this.accessTokenExpirationMinutes}m`})
    }

    public async generateRefreshToken(userId: string) 
    {
        const refreshTokenSecret = await Secrets.instance.getRefreshTokenSecret()
        return jwt.sign({userId: userId, type: TokenType.Refresh}, refreshTokenSecret, 
            {expiresIn: `${this.refreshTokenExpirationMinutes}m`})
    }

    public async verifyAuthentication(authHeader: string, targetType: TokenType = TokenType.Auth): Promise<string | undefined>
    {
        const tokens = authHeader?.split(" ") ?? []
        if (tokens.length != 2 || tokens[0].toLowerCase() != "bearer")
        {
            return
        }
        
        // Extract the token data
        let userId: string | undefined
        let tokenSecret: string
        if (targetType == TokenType.Auth)
        {
            tokenSecret = await Secrets.instance.getAccessTokenSecret()
        }
        else
        {
            tokenSecret = await Secrets.instance.getRefreshTokenSecret()
        }
        jwt.verify(tokens[1], tokenSecret, (err, authId: any) => {
            if (err == null && authId?.type == targetType) { 
                userId = authId?.userId
            }
        })

        return userId
    }

    public getDecodedUserData(request: LambdaRequest): UserData
    {
        console.log("getDecodeUserData: " + JSON.stringify(request))
        return {
            id: "123",
            username: "testUserName"
        }
    }
}

export enum TokenType
{
    Auth = 1,
    Refresh
}

export interface UserData
{
    id: string
    username: string
}
