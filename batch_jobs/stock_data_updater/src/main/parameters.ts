import aws from "aws-sdk"

export class Parameters
{
    public static instance = new Parameters()

    public mongoDbConnectionString: string
    public alphaVantageApiKey: string

    public constructor()
    {
        this.mongoDbConnectionString = ""
        this.alphaVantageApiKey = ""
    }

    public async initialize()
    {
        const ssm = new aws.SSM()
        let self = this

        self.mongoDbConnectionString = await this.getParameter(ssm, "/freedays/mongoDb/connectionString")
        self.alphaVantageApiKey = await this.getParameter(ssm, "/freedays/alphavantage/apikey")
    }

    private async getParameter(ssm: aws.SSM, name: string): Promise<string>
    {
        let retVal: string = ""
        await ssm.getParameter({Name:name, WithDecryption: true}, (err: any, data: any) => {
            if (err || data.Parameter?.Value == null)
            {
                throw new Error(`Error trying to load parameter ${name}: ${err}`)
            }
            retVal = data.Parameter?.Value
        }).promise()

        return retVal
    }
}