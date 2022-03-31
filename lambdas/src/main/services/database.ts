import * as aws from "aws-sdk"

export class Database
{
    public static instance = new Database()

    public getDb = () => new aws.DynamoDB({apiVersion: '2012-08-10'})
}
