import { Request } from "express";
import User from "../models/user.model";
import { ErrorType } from "../types/Error.type";
import { processBcrypt } from "../utils/encryption.util";

interface UserInputData {
  email: string;
  password: string;
  name: string;
}
const resolvers = {
  createUser: async (
    { userInput }: { userInput: UserInputData },
    req: Request
  ) => {
    const { email, password, name } = userInput;
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      const error: ErrorType = new Error("User already exists");
      throw error;
    }

    const hashedPass = await processBcrypt("hash", password);
    console.log(hashedPass);
    const user = new User({
      email,
      name,
      password: hashedPass,
    });

    const createdUser = await user.save();
    const createdUserData = createdUser.toObject();
    return {
      ...createdUserData,
      _id: createdUserData._id.toString(),
    };
  },
};

export default resolvers;
