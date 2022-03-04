import * as React from "react"

export const PerformanceGrid = (props: PerformanceGridProps) => {
    let rows = []
    for(let x of props?.entries)
    {
        rows.push(
        <div>
            <span>{x.label}</span>
            <span>{x.minValue}</span>
            <span>{x.meanValue}</span>
            <span>{x.maxValue}</span>
        </div>
        )
    }

    return (
        <div>
            {rows}
        </div>
    )
}

export interface PerformanceGridProps
{
    entries: Array<PerformanceEntry>
}

export interface PerformanceEntry
{
    label: string
    minValue: number
    meanValue: number
    maxValue: number
}