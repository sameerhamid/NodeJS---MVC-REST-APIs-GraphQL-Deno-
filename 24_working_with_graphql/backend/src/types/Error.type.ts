import { ValidationError } from "express-validator";

export interface ErrorType {
  message?: string;
  statusCode?: number;
  data?: ValidationError[];
}
