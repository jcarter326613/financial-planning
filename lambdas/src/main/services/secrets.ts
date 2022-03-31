import * as aws from "aws-sdk"

export class Secrets
{
    public static instance = new Secrets()

    private ssm: aws.SSM | undefined
    private accessTokenSecret: string | undefined
    private refreshTokenSecret: string | undefined

    public async getAccessTokenSecret(): Promise<string>
    {
        if (this.accessTokenSecret == null)
        {
            const ssm = await this.getSsm()
            this.accessTokenSecret = await this.getParameter(ssm, "/freedays/accessTokenSecret")
            if (this.accessTokenSecret == null || this.accessTokenSecret.length == 0)
            {
                throw new Error("accessTokenSecret null or blank")
            }
        }
        return this.accessTokenSecret
    }

    public async getRefreshTokenSecret(): Promise<string>
    {
        if (this.refreshTokenSecret == null)
        {
            const ssm = await this.getSsm()
            this.refreshTokenSecret = await this.getParameter(ssm, "/freedays/refreshTokenSecret")
            if (this.refreshTokenSecret == null || this.refreshTokenSecret.length == 0)
            {
                throw new Error("refreshTokenSecret null or blank")
            }
        }
        return this.refreshTokenSecret
    }

    private getSsm(): aws.SSM
    {
        if (this.ssm == null) { this.ssm = new aws.SSM() }
        return this.ssm
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