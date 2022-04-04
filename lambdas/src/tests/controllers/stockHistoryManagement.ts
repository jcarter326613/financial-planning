import { expect } from "chai"
import { StockHistoryManagement } from "../../main/controllers/stockHistoryManagement"
import { Database } from "../../main/services/database"
import * as sinon from "sinon"

describe('Stock history management', () => {
    let putItemMoc = sinon.fake((_1: any): {promise: () => Promise<any>} => {
        return {promise: () => Promise.resolve({})}
    })

    before(() => {
        sinon.replace(Database.instance, "getDb", (): any => {
            return {
                putItem: putItemMoc
            }
        })
    })

    beforeEach(() => {
        putItemMoc.resetHistory()
    })

    after(() => {
        sinon.restore()
    })

    it('add symbol', async () => {
        let controller = new StockHistoryManagement()
        let request = {
            queryStringParameters: { "symbol": "IBM" },
            pathParameters: undefined,
            headers: undefined,
            body: undefined
        }

        let result = await controller.addStockToTrack(request)
        expect(result.success, "Successful call").true
        expect(putItemMoc.calledOnceWith({
            TableName: "FreeDays_SymbolHistoryConfig",
            Item: {
                type: {S: "stock"},
                symbol: {S: "IBM"}
            }
        }), "Put called with right parameter").true
    })
})