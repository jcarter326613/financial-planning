import { expect } from "chai"
import { Account } from "../../main/controllers/account"
import { Database } from "../../main/database"
import * as sinon from "sinon"

describe('Account management', () => {
    beforeEach(() => {
        sinon.replace(Database.instance, "initialize", sinon.fake())
    })

    it('create account', async () => {
        let controller = new Account()
        let request = {
            queryStringParameters: undefined,
            pathParameters: undefined,
            body: {
                username: "testUsername",
                password: "testPassword"
            }
        }

        let insertMoc = sinon.fake((_1: any) => {})
        sinon.replace(Database.instance, "getAccountCollection", (): any => {
            return {
                insertOne: insertMoc
            }
        })

        let result = await controller.create(request)
        expect(result.success, "Action success").true
        expect(insertMoc.calledOnce, "Called insert once").true
        expect(insertMoc.calledOnceWith(sinon.match.has("username", "testUsername")), "Called insert with right username").true
        expect(insertMoc.calledOnceWith(sinon.match.has("hashedPassword")), "Called insert with right password").true
    })
})