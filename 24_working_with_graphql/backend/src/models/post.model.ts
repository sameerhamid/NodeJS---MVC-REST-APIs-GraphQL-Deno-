import mongoose, { Schema } from "mongoose";

/**
 * Represents a post in the application
 */
export interface PostType {
  /** Unique identifier for the post */
  _id: string;
  /** Title of the post */
  title: string;
  /** Content of the post */
  content: string;
  /** URL of the post's image */
  imageUrl: string;
  /** Creator of the post */
  creator: {
    /** Unique identifier for the creator */
    _id: string;
    name: string;
  };
  /** Date when the post was created */
  createdAt: string;
  updatedAt: string;
}

// Define the schema for a post
const postSchema = new Schema<PostType>(
  {
    // Title of the post
    title: {
      type: String,
      required: true, // Title is required
    },
    // Content of the post
    content: {
      type: String,
      required: true, // Content is required
    },
    // URL of the image associated with the post
    imageUrl: {
      type: String,
      required: true, // Image URL is required
    },
    // Creator of the post
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      name: {
        type: String,
        required: true,
      },
      required: true, // Creator is required
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt timestamps
);

// Create a mongoose model for posts using the defined schema
const Post = mongoose.model("Post", postSchema);

// Export the Post model for use in other parts of the application
export default Post;
