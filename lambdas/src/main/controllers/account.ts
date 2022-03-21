import { ArgumentsInvalidException } from "../exceptions/argumentsInvalidException"
import { Database } from "../database"
import { LambdaRequest } from "../lambdaRequest"
import { startCall } from "../lambdaShell"

import * as bcrypt from "bcrypt"

export const post_create = async (request: any) => startCall(request, instance.create)

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

        // Insert the symbol into the database
        let collection = Database.instance.getAccountCollection()
        let hashedPassword = await bcrypt.hash(password, 12)
        try
        {
            collection.insertOne({ "username": username, "hashedPassword": hashedPassword })
            return {"success": true, "message": undefined}
        }
        catch (e: any)
        {
            console.error(`ERROR creating username: ${JSON.stringify(e)}`)
            return {"success": false, "message": "Account already exists"}
        }
    }
}

const instance = new Account()

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