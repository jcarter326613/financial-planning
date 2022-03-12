export class ClosePrice
{
    public date: Date
    public price: number
    public dividendAmount: number

    constructor(date: Date, price: number, dividendAmount: number)
    {
        this.date = date
        this.price = price
        this.dividendAmount = dividendAmount
    }
}