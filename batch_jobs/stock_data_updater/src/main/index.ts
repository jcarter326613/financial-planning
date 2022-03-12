import aws from "aws-sdk"
import { Parameters } from "./parameters"
import { StockDataRetriever } from "./stockDataRetriever"

aws.config.update({region: 'us-east-1'})

async function main()
{
    await Parameters.instance.initialize()
    let stockRetriever = new StockDataRetriever()
    stockRetriever.retrieveDataForSymbol("TQQQ")
}
main()

//https://www.alphavantage.co/
//https://query1.finance.yahoo.com/v7/finance/download/SPY?interval=1d&events=history&includeAdjustedClose=true