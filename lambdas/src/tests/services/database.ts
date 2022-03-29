import { Collection } from "../../main/services/database"
import { expect } from "chai"
import * as aws from "aws-sdk"
import * as sinon from "sinon"
import { PromiseResult } from "aws-sdk/lib/request"

describe('Database service', () => {
    it('standard insert', async () => {
        let mocDb: any = new aws.DynamoDB({apiVersion: '2012-08-10'})
        sinon.stub(mocDb, "putItem").returns({promise: () => Promise.resolve()})
        let collection = new Collection("testTable", mocDb)
        
        await collection.insertOne({testString: "test", testNumber: 123})

        expect(mocDb.putItem.calledOnce, "PutItem called once").true
        expect(mocDb.putItem.calledOnceWith({ 
                TableName: "testTable",
                Item: {
                    testString: {S: "test"},
                    testNumber: {N: 123}
                }
            }), "PutItem called with the right parameters").true
    })
    it('standard findOne', async () => {
        let mocDb: any = new aws.DynamoDB({apiVersion: '2012-08-10'})
        let findResultData = {
            testString: { S: "test"}, 
            testNumber: { N: "123" },
            testValue: { S: "the values" }
        }
        let findResult: PromiseResult<aws.DynamoDB.GetItemOutput, aws.AWSError> = {
            Item: findResultData,
            $response: {
                hasNextPage: () => false,
                nextPage: () => {},
                data: {Item: findResultData},
                error: (() => {})(),
                requestId: "1",
                redirectCount: 0,
                retryCount: 0,
                httpResponse: new aws.HttpResponse()
            }
        }
        sinon.stub(mocDb, "getItem").returns({promise: () => Promise.resolve(findResult)})
        let collection = new Collection("testTable", mocDb)
        
        let result = await collection.findOne<any>({testString: "test", testNumber: 123})

        expect(mocDb.getItem.calledOnce, "PutItem called once").true
        expect(mocDb.getItem.calledOnceWith({ 
                TableName: "testTable",
                Key: {
                    testString: {S: "test"},
                    testNumber: {N: 123}
                }
            }), "GetItem called with the right parameters").true
        expect(result.testString, "Test String").equal("test")
        expect(result.testNumber, "Test Number").equal(123)
        expect(result.testValue, "Test Value").equal("the values")
    })
})