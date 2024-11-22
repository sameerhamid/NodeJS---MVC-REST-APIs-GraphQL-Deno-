import mongoose, { Schema } from "mongoose";
import { PostType } from "./post.model";

/**
 * Represents a user in the application
 */
export interface UserType {
  /**
   * The email address of the user
   */
  email: string;
  /**
   * The password of the user
   */
  password: string;
  /**
   * The name of the user
   */
  name: string;
  /**
   * The status of the user
   */
  status: string;
  /**
   * The date and time when the user was created
   */
  createdAt: string;
  /**
   * The posts created by the user
   */
  posts: PostType[];
}

// Define the schema for a user
const userSchema = new Schema<UserType>(
  {
    // Email address of the user
    email: {
      type: String,
      required: true, // Email is required
      unique: true, // Email must be unique
    },
    // Password of the user
    password: {
      type: String,
      required: true, // Password is required
    },
    // Name of the user
    name: {
      type: String,
      required: true, // Name is required
    },
    // Status of the user
    status: {
      type: String,
      defaule: "I am new!", // Status is required
    },
    // Posts created by the user
    posts: [
      {
        type: Schema.Types.ObjectId, // Reference to Post documents
        ref: "Post",
      },
    ],
  },
  { timestamps: true } // Automatically add createdAt and updatedAt timestamps
);

// Create a mongoose model for users using the defined schema
const User = mongoose.model("User", userSchema);

// Export the User model for use in other parts of the application
export default User;
