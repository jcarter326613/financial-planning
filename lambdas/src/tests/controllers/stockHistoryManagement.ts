import { expect } from "chai"
import { StockHistoryManagement } from "../../main/controllers/stockHistoryManagement"
import { Database } from "../../main/services/database"
import * as sinon from "sinon"

describe('Stock history management', () => {
    let putItemMoc = sinon.fake((_1: any): {promise: () => Promise<any>} => {
        return {promise: () => Promise.resolve({})}
    })
    let scanMoc = sinon.fake((document: any): {promise: () => Promise<any>} => {
        if (document?.TableName == "FreeDays_SymbolHistoryConfig")
        {
            return {promise: () => Promise.resolve({
                Items: [
                    {symbol: {S: "IBM"}},
                    {symbol: {S: "GOOG"}}
                ]
            })}
        }
        return {promise: () => Promise.resolve({})}
    })

    before(() => {
        sinon.replace(Database.instance, "getDb", (): any => {
            return {
                putItem: putItemMoc,
                scan: scanMoc
            }
        })
    })

    beforeEach(() => {
        putItemMoc.resetHistory()
        scanMoc.resetHistory()
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

    it('list symbols', async () => {
        let controller = new StockHistoryManagement()
        let result = await controller.listStocksToTrack(null)
        expect(result.symbols, "Successful call").not.null
        expect(result.symbols.length, "Correct number of results").equal(2)
        expect(result.symbols[0], "Result 1 correct").equal("IBM")
        expect(result.symbols[1], "Result 2 correct").equal("GOOG")
        expect(scanMoc.calledOnceWith({
            TableName: "FreeDays_SymbolHistoryConfig"
        }), "Scan called with right parameter").true
    })
})