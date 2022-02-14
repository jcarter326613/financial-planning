import * as React from "react"
import { PageProps } from "gatsby"

const IndexRoute = ({ path }: PageProps) => {
  return (
    <main>
      <h1>Path: {path}</h1>
    </main>
  )
}

export default IndexRoute