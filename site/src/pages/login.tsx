import React, { useState } from "react"
import { PageProps } from "gatsby"

const LoginRoute = ({ path }: PageProps) => {
    const loginUser = () => {alert("Login")}

    return (
        <main>
            <table>
                <tr><td>Username</td><td><input type="text"></input></td></tr>
                <tr><td>Password</td><td><input type="text"></input></td></tr>
            </table>
            <button onClick={() => loginUser()}>Login</button>
        </main>
    )
}

export default LoginRoute