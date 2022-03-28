import { ArgumentsInvalidException } from "../exceptions/argumentsInvalidException"
import { Authentication, TokenType as AuthTokenType } from "../services/authentication"
import { Database, ObjectId } from "../services/database"
import { HttpError } from "../exceptions/httpError"
import { LambdaRequest } from "../lambdaRequest"
import { startCall } from "../lambdaShell"
import { Secrets } from "../services/secrets"
import { UnauthorizedException } from "../exceptions/unauthorizedException"

import * as bcrypt from "bcrypt"

export const post_create = async (request: any) => startCall(request, instance.create)
export const post_login = async (request: any) => startCall(request, instance.login)
export const post_authorize = async (request: any) => startCall(request, instance.authorize)

export class Account
{
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
        let collection = Database.instance.getAccountCollection()
        if ((await collection.findOne({username: username})) != null)
        {
            throw new HttpError(409, "User already exists")
        }

        // Insert the symbol into the database
        let hashedPassword = await bcrypt.hash(password, 12)
        try
        {
            let dbObject: DatabaseUserObject = {
                _id: undefined,
                username: username, 
                hashedPassword: hashedPassword
            }
            await collection.insertOne(dbObject)
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
        Authentication.instance.initialize()

        if (request.body?.username == null || request.body?.password == null)
        {
            throw new HttpError(400, "Bad request")
        }
        let username = request.body?.username
        let password = request.body?.password

        let collection = Database.instance.getAccountCollection()
        let userDto: DatabaseUserObject | null  = await collection.findOne<DatabaseUserObject>({username: username})
        if (userDto?._id == null || !await bcrypt.compare(password, userDto.hashedPassword ?? ""))
        {
            throw new HttpError(401, "Credentials invalid")
        }

        const accessToken = Authentication.instance.generateAccessToken(userDto._id.toString())
        const refreshToken = Authentication.instance.generateRefreshToken(userDto._id.toString())
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
        const userId = Authentication.instance.verifyAuthentication(request.headers["authorization"], AuthTokenType.Auth)
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
    _id: ObjectId | undefined
    username: string | undefined
    hashedPassword: string | undefined
}