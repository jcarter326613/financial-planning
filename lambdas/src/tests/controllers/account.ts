import { expect } from "chai"
import { Account } from "../../main/controllers/account"
import { Database } from "../../main/services/database"
import { HttpError } from "../../main/exceptions/httpError"
import * as sinon from "sinon"
import * as aws from "aws-sdk"

describe('Account management', () => {
    let putItemMoc = sinon.fake((_1: any): {promise: () => Promise<any>} => {
        return {promise: () => Promise.resolve({})}
    })
    let queryMoc = sinon.fake((lookup: aws.DynamoDB.QueryInput): {promise: () => Promise<any>} => {
        let response: any
        if (lookup.TableName == "FreeDays_Account" && lookup.IndexName == "Unique_username" &&
            lookup.ExpressionAttributeValues[":username"]?.S == "dupUser") {
            
            response = {
                Items: [
                    {
                        username: {S: "dupUser"},
                        hashedPassword: {S: "sefsoesfoj"}
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
        sinon.replace(Database.instance, "getDb", (): any => {
            return {
                putItem: putItemMoc,
                query: queryMoc
            }
        })
    })

    beforeEach(() => {
        putItemMoc.resetHistory()
        queryMoc.resetHistory()
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
})