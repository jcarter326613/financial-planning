export class LocalTime {
    hour: number
    minute: number
    second: number

    constructor(hour: number, minute: number, second = 0) {
        this.hour = hour
        this.minute = minute
        this.second = second
    }

    isAfter(o: LocalTime): boolean {
        return this.hour > o.hour ||
            (this.hour == o.hour && this.minute > o.minute) ||
            (this.hour == o.hour && this.minute == o.minute && this.second > o.second)
    }

    isBefore(o: LocalTime): boolean {
        return this.hour < o.hour ||
            (this.hour == o.hour && this.minute < o.minute) ||
            (this.hour == o.hour && this.minute == o.minute && this.second < o.second)
    }
}
