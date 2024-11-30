import { buildSchema } from "graphql";

const Schema = buildSchema(`
  type Post {
    _id: ID!
    title: String!
    content: String!
    imageUrl: String! 
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    _id: ID!
    email: String!
    password: String
    name: String!
    status: String!
    posts: [Post!]! 
  }

  type AuthData{
  token:String!
  userId:String!
  }


  type PostData{
  posts:[Post!]!
  totalPosts:Int!
  }
  input UserInputData {
    email: String!
    password: String!
    name: String!
  }

  input PostInputData{
    title:String!
    content:String!
    imageUrl:String!
  }

  type RootMutation {
    createUser(userInput: UserInputData!): User!
    createPost(postInput:PostInputData!): Post!
  }

  type RootQuery {
    login(email: String!, password: String!): AuthData!
    posts:PostData!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);

export default Schema;
