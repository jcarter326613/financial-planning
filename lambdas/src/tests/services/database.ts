import { Collection } from "../../main/services/database"
import { expect } from "chai"
import * as aws from "aws-sdk"
import * as sinon from "sinon"

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
})