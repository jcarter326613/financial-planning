export class ClosePrice
{
    public date: Date
    public price: number

    constructor(date: Date, price: number)
    {
        this.date = date
        this.price = price
    }
}