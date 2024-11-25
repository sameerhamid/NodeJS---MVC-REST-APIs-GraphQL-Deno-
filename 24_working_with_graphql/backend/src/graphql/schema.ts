import { buildSchema } from "graphql";

const Schema = buildSchema(`

    type Post{
    _id:ID!
    title:String!
    content:String!
    iamgeUrl:String!
    creator:User!
    createdAt:String!
    updatedAt:String!
    }

    type User{
    _id:ID!
    email: String!
    password: String
    name: String!
    status:String!
    post:[Post!]!
    }

    input UserInputData{
        email: String!
        password: String!
        name: String!
    }
    type RootMutation{
        createUser(userInput:UserInputData!):User!
    }
  
    type RootQuery{
        hello:String
    }
   schema{
   query:RootQuery
   mutation: RootMutation
   }
    `);

export default Schema;
