import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query'
import { Post, User } from './types'

const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
  }),
  tagTypes: ['Post', 'User'],
  endpoints: (build) => ({
    getPosts: build.query<Post[], void>({
      query: () => '/posts',
    }),
    getUsers: build.query<User[], void>({
      query: () => '/users',
    }),
    addPost: build.mutation<Post, Omit<Post, 'id'>>({
      query: (body) => ({
        url: 'post',
        method: 'POST',
        body,
      }),
    }),
    editPost: build.mutation<Post, Partial<Post> & Pick<Post, 'id'>>({
      query: (body) => ({
        url: `post/${body.id}`,
        method: 'POST',
        body,
      }),
    }),
  }),
})