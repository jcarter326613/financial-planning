import { SSM } from "aws-sdk"

export class Parameters
{
    public static instance = new Parameters()

    public mongoDbConnectionString: string

    public constructor()
    {
        this.mongoDbConnectionString = ""
    }

    public async initialize()
    {
        const ssm = new SSM()
        let self = this
        await ssm.getParameter({Name:"/freedays/mongoDb/connectionString", WithDecryption: true}, (err, data) => {
            if (err || data.Parameter?.Value == null)
            {
                throw new Error(`Error trying to load parameter /freedays/mongoDb/connectionString: ${err}`)
            }
            self.mongoDbConnectionString = data.Parameter?.Value
        }).promise()
    }
}