import { ValidationError } from "express-validator";
import { ErrorMsgType } from "../graphql/resolvers";

export interface ErrorType {
  message?: string;
  statusCode?: number;
  data?: ValidationError[] | ErrorMsgType[];
}
