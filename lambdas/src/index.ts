import { LocalTime } from "./local-time"

const entry = () =>
{
    let time = new LocalTime(1,2,3)
    return `Hello world ${time.hour}`
}

export default entry