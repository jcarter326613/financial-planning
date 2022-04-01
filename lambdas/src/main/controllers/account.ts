import { ArgumentsInvalidException } from "../exceptions/argumentsInvalidException"
import { Authentication, TokenType as AuthTokenType } from "../services/authentication"
import { Database } from "../services/database"
import { HttpError } from "../exceptions/httpError"
import { LambdaRequest } from "../lambdaRequest"
import { startCall } from "../lambdaShell"
import { Secrets } from "../services/secrets"
import { UnauthorizedException } from "../exceptions/unauthorizedException"
import * as aws from "aws-sdk"
import * as bcrypt from "bcrypt"

export const post_create = async (request: any) => startCall(request, instance.create)
export const post_login = async (request: any) => startCall(request, instance.login)
export const post_authorize = async (request: any) => startCall(request, instance.authorize)

export class Account
{
    private static accountCollectionName = "FreeDays_Account"

    public async create(request: LambdaRequest<CreateAccountRequest>): Promise<CreateAccountResponse>
    {
        // Validate the input
        let username: string | undefined
        let password: string | undefined
        if (request.body?.username != null && request.body?.password != null)
        {
            username = request.body?.username?.trim()
            password = request.body?.password?.trim()
        }
        if (username == null || password == null) throw new ArgumentsInvalidException("Invalid parameters for account creation")
        if (username.length == 0 || password.length == 0) throw new ArgumentsInvalidException("Username and password can not be blank")

        // Check if the user already exists
        const db = Database.instance.getDb()
        const document = {
            TableName: Account.accountCollectionName,
            KeyConditionExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": {S: username}
            }
        }
        const result = await db.query(document).promise()
        if (result.Count != 0)
        {
            throw new HttpError(409, "User already exists")
        }

        // Insert the symbol into the database
        let hashedPassword = await bcrypt.hash(password, 10)
        try
        {
            const document = {
                TableName: Account.accountCollectionName,
                Item: {
                    username: {S: username},
                    hashedPassword: {S: hashedPassword}
                }
            }
            const result = await db.putItem(document).promise()
            if (result.$response?.error != null)
            {
                const message = JSON.stringify(result.$response.error)
                console.error(`Error inserting user in database during create: ${message}`)
                throw new Error(message)
            }
            return {"success": true, "message": undefined}
        }
        catch (e: any)
        {
            console.error(`ERROR creating username: ${JSON.stringify(e)}`)
            throw new Error("Error while creating account")
        }
    }

    public async login(request: LambdaRequest<LoginAccountRequest>): Promise<LoginAccountResponse>
    {
        if (request.body?.username == null || request.body?.password == null)
        {
            throw new HttpError(400, "Bad request")
        }
        let username = request.body?.username
        let password = request.body?.password

        let db = Database.instance.getDb()
        let document = {
            TableName: Account.accountCollectionName,
            Key: {
                username: { S: username }
            }
        }
        let hashedPassword = (await db.getItem(document).promise()).Item?.hashedPassword?.S
        if (hashedPassword == null || !await bcrypt.compare(password, hashedPassword ?? ""))
        {
            throw new HttpError(401, "Credentials invalid")
        }

        const accessToken = await Authentication.instance.generateAccessToken(username)
        const refreshToken = await Authentication.instance.generateRefreshToken(username)
        return {
            accessToken: accessToken, 
            accessTokenExpirationMinutes: Authentication.instance.accessTokenExpirationMinutes,
            refreshToken: refreshToken,
            refreshTokenExpirationMinutes: Authentication.instance.refreshTokenExpirationMinutes
        }
    }

    public async authorize(request: LambdaRequest<void>): Promise<AuthorizeResponse>
    {
        // Designed according to https://www.alexdebrie.com/posts/lambda-custom-authorizers/

        // Extract the user id
        if (request.headers == null) throw new UnauthorizedException()
        const userId = await Authentication.instance.verifyAuthentication(request.headers["authorization"], AuthTokenType.Auth)
        if (userId == null) throw new UnauthorizedException()

        // Return the authenticated user details
        const awsAccountId = process.env.AwsAccountId
        const restApiId = process.env.RestApiId
        return {
            "principalId": userId,
            "policyDocument": {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Action": "execute-api:Invoke",
                        "Effect": "Allow",
                        "Resource": `arn:aws:execute-api:us-east-1:${awsAccountId}:${restApiId}/*`
                    }
                ]
            },
            "context": {
                "userId": userId
            }
        }
    }
}

const instance = new Account()

/**
 * Requests and responses
 */
interface CreateAccountRequest
{
    username: string | undefined
    password: string | undefined
}

interface CreateAccountResponse
{
    success: boolean
    message: string | undefined
}

interface LoginAccountRequest
{
    username: string | undefined
    password: string | undefined
}

interface LoginAccountResponse
{
    accessToken: string
    accessTokenExpirationMinutes: number
    refreshToken: string
    refreshTokenExpirationMinutes: number
}

interface AuthorizeResponse
{
    principalId: string
    policyDocument: {
        Version: string,
        Statement: Array<{
            Action: string,
            Effect: string,
            Resource: string
        }>
    }
    context: Record<string, string>
}

/**
 * Database objects
 */
interface DatabaseUserObject
{
    username: string | undefined
    hashedPassword: string | undefined
}