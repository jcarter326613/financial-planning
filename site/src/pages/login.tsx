import React, { useState } from "react"
import { PageProps } from "gatsby"
import { api } from "../api/api"

const LoginRoute = ({ path }: PageProps) => {
    const loginUser = () => {
        /*
        let result = api.endpoints.login.useMutation({
            username: "jason",
            password: "qwerty"
        })
        */
        let result2 = api.endpoints.login2.useQuery({
            username: "jason",
            password: "qwerty"
        })
        console.log(result2.data?.accessToken)
        console.log("test")
    }

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