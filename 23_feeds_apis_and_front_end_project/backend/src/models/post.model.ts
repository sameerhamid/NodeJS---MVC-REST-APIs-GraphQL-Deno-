import mongoose, { Schema } from "mongoose";

// Define the schema for a post
const postSchema = new Schema(
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
      type: Object, // Creator is an object containing creator details
      // Uncomment the lines below if referencing a User model
      // type: Schema.Types.ObjectId,
      // ref: "User",
      required: true, // Creator is required
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt timestamps
);

// Create a mongoose model for posts using the defined schema
const Post = mongoose.model("Post", postSchema);

// Export the Post model for use in other parts of the application
export default Post;
