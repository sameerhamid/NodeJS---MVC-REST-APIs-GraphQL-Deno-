import { buildSchema } from "graphql";

const Schema = buildSchema(`
    type TestData{
    text: String!
    views: Int!
    }
    type RootQuery{
    hello:TestData!
    }
        schema{
        query:RootQuery
        }
    `);

export default Schema;
