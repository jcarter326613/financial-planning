import * as jwt from "jsonwebtoken"
import { LambdaRequest } from "../lambdaRequest"
import { Secrets } from "./secrets"

export class Authentication
{
    public static instance: Authentication = new Authentication()

    public accessTokenExpirationMinutes = 15
    public refreshTokenExpirationMinutes = 30

    private accessTokenSecret: string | undefined
    private refreshTokenSecret: string | undefined
    private isInitialized: boolean = false

    constructor()
    {
    }

    public initialize()
    {
        if (this.isInitialized) return
        this.isInitialized = true

        let accessTokenSecret = Secrets.instance.accessTokenSecret
        let refreshTokenSecret = Secrets.instance.refreshTokenSecret
        if (accessTokenSecret == null || refreshTokenSecret == null)
        {
            throw new Error("Access token secret not defined")
        }

        this.accessTokenSecret = accessTokenSecret
        this.refreshTokenSecret = refreshTokenSecret
    }

    public generateAccessToken(userId: string) 
    {
        if (this.accessTokenSecret === undefined)
        {
            throw new Error("Authentication not initialized")
        }
        return jwt.sign({userId: userId, type: TokenType.Auth}, this.accessTokenSecret, 
            {expiresIn: `${this.accessTokenExpirationMinutes}m`}) 
    }

    public generateRefreshToken(userId: string) 
    {
        if (this.refreshTokenSecret === undefined)
        {
            throw new Error("Authentication not initialized")
        }
        return jwt.sign({userId: userId, type: TokenType.Refresh}, this.refreshTokenSecret, 
            {expiresIn: `${this.refreshTokenExpirationMinutes}m`})
    }

    public verifyAuthentication(authHeader: string, targetType: TokenType = TokenType.Auth): string | undefined 
    {
        const tokens = authHeader?.split(" ") ?? []
        if (tokens.length != 2 || tokens[0].toLowerCase() != "bearer")
        {
            return
        }
        
        if (this.accessTokenSecret === undefined || this.refreshTokenSecret === undefined)
        {
            throw new Error("Authentication not initialized")
        }

        // Extract the token data
        let userId: string | undefined
        let tokenSecret: string
        if (targetType == TokenType.Auth)
        {
            tokenSecret = this.accessTokenSecret
        }
        else
        {
            tokenSecret = this.refreshTokenSecret
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
