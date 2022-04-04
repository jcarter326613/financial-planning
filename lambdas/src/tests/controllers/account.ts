import { expect } from "chai"
import { Account } from "../../main/controllers/account"
import { Database } from "../../main/services/database"
import { HttpError } from "../../main/exceptions/httpError"
import { Secrets } from "../../main/services/secrets"
import * as sinon from "sinon"
import * as aws from "aws-sdk"

describe('Account management', () => {
    let putItemMoc = sinon.fake((_1: any): {promise: () => Promise<any>} => {
        return {promise: () => Promise.resolve({})}
    })
    let getItemMoc = sinon.fake((lookup: aws.DynamoDB.GetItemInput): {promise: () => Promise<any>} => {
        let response: any
        if (lookup.TableName == "FreeDays_Account" &&
            lookup.Key["username"]?.S == "dupUser") {
            
            response = {
                Item: {
                    username: {S: "dupUser"},
                    hashedPassword: {S: "$2b$10$tlClgawX2LJLwxB0LEWh/eK1OlhR7q35nBbAcjyRuXkx3GrxmWdR6"} //querty
                }
            }
        } else {
            response = null
        }
        return {promise: () => Promise.resolve(response)}
    })
    let queryMoc = sinon.fake((lookup: aws.DynamoDB.QueryInput): {promise: () => Promise<any>} => {
        let response: any
        if (lookup.TableName == "FreeDays_Account" &&
            lookup.ExpressionAttributeValues[":username"]?.S == "dupUser") {
            
            response = {
                Items: [
                    {
                        username: {S: "dupUser"},
                        hashedPassword: {S: "$2b$10$tlClgawX2LJLwxB0LEWh/eK1OlhR7q35nBbAcjyRuXkx3GrxmWdR6"} //querty
                    }
                ],
                Count: 1
            }
        } else {
            response = {
                Count: 0
            }
        }
        return {promise: () => Promise.resolve(response)}
    })

    before(() => {
        sinon.replace(Secrets.instance, "getAccessTokenSecret", (): any => "accessTokenSecret")
        sinon.replace(Secrets.instance, "getRefreshTokenSecret", (): any => "refreshTokenSecret")

        sinon.replace(Database.instance, "getDb", (): any => {
            return {
                putItem: putItemMoc,
                getItem: getItemMoc,
                query: queryMoc
            }
        })
    })

    beforeEach(() => {
        putItemMoc.resetHistory()
        queryMoc.resetHistory()
    })

    after(() => {
        sinon.restore()
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

        // Run the test
        let result = await controller.create(request)
        expect(result.success, "Action success").true
        expect(putItemMoc.calledOnce, "Called insert once").true
        expect(putItemMoc.calledOnceWith({
                TableName: "FreeDays_Account",
                Item: {
                    username: {S: "testUsername"},
                    hashedPassword: {S: sinon.match.any}
                }
            }), "Called insert with right username").true
        expect(putItemMoc.calledOnceWith({
                TableName: "FreeDays_Account",
                Item: {
                    username: {S: "testUsername"},
                    hashedPassword: {S: "testPassword"}
                }
            }), "Password hashed").false
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

    it('login success', async () => {
        let controller = new Account()
        let request = {
            queryStringParameters: undefined,
            pathParameters: undefined,
            headers: undefined,
            body: {
                username: "dupUser",
                password: "qwerty"
            }
        }

        let response = await controller.login(request)
        expect(response.accessToken.length, "access token supplied").greaterThan(0)
        expect(response.refreshToken.length, "refresh token supplied").greaterThan(0)
    })

    it('login failed', async () => {
        let controller = new Account()
        let request = {
            queryStringParameters: undefined,
            pathParameters: undefined,
            headers: undefined,
            body: {
                username: "dupUser",
                password: "qwerty2"
            }
        }

        try
        {
            let response = await controller.login(request)
            expect.fail("Password was invalid")
        }
        catch(e: any)
        {
            expect(e instanceof HttpError, "Correct error type").true
            expect((e as HttpError).statusCode, "Correct error code").equals(401)
        }
    })
})