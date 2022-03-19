import { expect } from "chai"
import { StockHistoryManagement } from "../../main/controllers/stockHistoryManagement"

describe('Stock history management', () => {
    it('base case', async () => {
        let controller = new StockHistoryManagement()
        let request = {
            queryStringParameters: { "symbol": "IBM" },
            pathParameters: undefined,
            body: undefined
        }
        let result = controller.addStockToTrack(request)
        expect(result.hello).equals("world")
    })
})