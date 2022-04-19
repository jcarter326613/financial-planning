import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { LoginRequest, LoginResponse } from './login'

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
  }),
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query(body) {
        return {
          url: `account/login`,
          method: "POST",
          body
        }
      }
    }),
    login2: build.query<LoginResponse, LoginRequest>({
      query: (code) => {
        return ({
          url: 'account/login',
          method: 'POST',
          body: code
        })
      }
    })
  })
})
