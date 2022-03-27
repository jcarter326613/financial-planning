import { expect } from "chai"
import { Account } from "../../main/controllers/account"
import { Database } from "../../main/services/database"
import * as sinon from "sinon"
import { HttpError } from "../../main/exceptions/httpError"

describe('Account management', () => {
    let insertMoc = sinon.fake((_1: any) => {})
    let findMoc = sinon.fake((lookup: {username: string}) => {
        if (lookup.username == "dupUser")
        {
            return {username: "dupUser", hashedPassword: "sefsoesfoj"}
        }
        return null
    })

    before(() => {
        sinon.replace(Database.instance, "getAccountCollection", (): any => {
            return {
                insertOne: insertMoc,
                findOne: findMoc
            }
        })
    })

    beforeEach(() => {
        insertMoc.resetHistory()
        findMoc.resetHistory()
    })

    it('create account', async () => {
        let controller = new Account()
        let request = {
            queryStringParameters: undefined,
            pathParameters: undefined,
            headers: undefined,
            body: {
                username: "testUsername",
                password: "testPassword"
            }
        }

        let result = await controller.create(request)
        expect(result.success, "Action success").true
        expect(insertMoc.calledOnce, "Called insert once").true
        expect(insertMoc.calledOnceWith(sinon.match.has("username", "testUsername")), "Called insert with right username").true
        expect(insertMoc.calledOnceWith(sinon.match.has("hashedPassword")), "Called insert with password").true
        expect(insertMoc.calledOnceWith(sinon.match.has("hashedPassword", "testPassword")), "Password hashed").false
    })

    it('create account not allowing dups', async () => {
        let controller = new Account()
        let request = {
            queryStringParameters: undefined,
            pathParameters: undefined,
            headers: undefined,
            body: {
                username: "dupUser",
                password: "testPassword"
            }
        }

        try
        {
            await controller.create(request)
            expect(false, "SHould not be here").true
        }
        catch (e)
        {
            expect(e instanceof HttpError, "Correct error type").true
            expect((e as HttpError).statusCode, "Correct error code").equals(409)
        }
    })
})