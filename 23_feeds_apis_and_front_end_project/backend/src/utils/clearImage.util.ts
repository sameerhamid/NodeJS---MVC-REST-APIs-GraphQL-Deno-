import fs from "fs";
import path from "path";

/**
 * Deletes a file asynchronously and handles any errors
 * @param {string} filePath - the path to the file to delete
 */
export const clearImage = (filePath: string): void => {
  // Construct the full file path
  filePath = path.join(__dirname, "../..", filePath);

  // Delete the file asynchronously and handle any errors
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting the file:", err);
    }
  });
};
