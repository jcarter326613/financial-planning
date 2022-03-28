import { expect } from "chai"
import { StockHistoryManagement } from "../../main/controllers/stockHistoryManagement"
import { Database } from "../../main/services/database"
import * as sinon from "sinon"

describe('Stock history management', () => {
    it('base case', async () => {
        let controller = new StockHistoryManagement()
        let request = {
            queryStringParameters: { "symbol": "IBM" },
            pathParameters: undefined,
            headers: undefined,
            body: undefined
        }

        let upsertMoc = sinon.fake((_1: any, _2: any, _3: any) => {})
        sinon.replace(Database.instance, "getStockHistoryConfigCollection", (): any => {
            return {
                updateOne: upsertMoc
            }
        })

        let result = await controller.addStockToTrack(request)
        expect(result.success).true
        expect(upsertMoc.calledOnce).true
        expect(upsertMoc.calledOnceWith({ name: "IBM" }, { $set: { name: "IBM" } }, { upsert: true })).true
    })
})