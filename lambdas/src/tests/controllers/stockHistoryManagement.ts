import { expect } from "chai"
import { StockHistoryManagement } from "../../main/controllers/stockHistoryManagement"
import { Database } from "../../main/database"
import * as sinon from "sinon"
import * as mongoDB from "mongodb"

describe('Stock history management', () => {
    beforeEach(() => {
        sinon.replace(Database.instance, "initialize", sinon.fake())
    })

    it('base case', async () => {
        let controller = new StockHistoryManagement()
        let request = {
            queryStringParameters: { "symbol": "IBM" },
            pathParameters: undefined,
            body: undefined
        }

        let upsertMoc = sinon.fake(() => {})
        sinon.replace(Database.instance, "getStockHistoryConfigCollection", (): any => {
            return {
                updateOne: upsertMoc
            }
        })

        let result = await controller.addStockToTrack(request)
        expect(result.success).true
        expect(upsertMoc.calledOnce).true
    })
})