import * as React from "react"
import { PageProps } from "gatsby"
import { PerformanceGrid, PerformanceEntry, PerformanceGridProps } from "../components/performance_grid"

const IndexRoute = ({ path }: PageProps) => {
    let gridProperties = {
        entries: [{
            label: "Test1",
            minValue: 1,
            meanValue: 2,
            maxValue: 3
        }]
    }
    
    return (
        <main>
            <div style={{float: "right"}}><a href="/login">Login</a></div>
            <h1>Hello world</h1>
            <PerformanceGrid entries={gridProperties.entries} />
        </main>
    )
}

export default IndexRoute