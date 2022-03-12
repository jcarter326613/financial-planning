import { config } from "aws-sdk"
import { mainModule } from "process"
import { Parameters } from "./parameters"

config.update({region: 'us-east-1'})

async function main()
{
    await Parameters.instance.initialize()
    console.log(`Extracted connection string ${Parameters.instance.mongoDbConnectionString}`)
}
main()

//https://www.alphavantage.co/
//https://query1.finance.yahoo.com/v7/finance/download/SPY?interval=1d&events=history&includeAdjustedClose=true