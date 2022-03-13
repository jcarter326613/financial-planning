import aws from "aws-sdk"
import { Database } from "./database"
import { Parameters } from "./parameters"
import { StockDataRetriever } from "./stockDataRetriever"

aws.config.update({region: 'us-east-1'})

async function main()
{
    // Initialize the environment
    await Parameters.instance.initialize()

    // Get the stock data
    let symbol = "TQQQ"
    let stockRetriever = new StockDataRetriever()
    let prices = await stockRetriever.retrieveDataForSymbol(symbol)

    // Insert the stock data into the database
    let db = new Database()
    await db.initialize()
    await db.mergeInPrices(prices, symbol)

    process.exit(0)
}
main()

//https://www.alphavantage.co/
//https://query1.finance.yahoo.com/v7/finance/download/SPY?interval=1d&events=history&includeAdjustedClose=true