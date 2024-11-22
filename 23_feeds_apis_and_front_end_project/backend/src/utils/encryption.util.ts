import bcrypt from "bcryptjs";

/**
 * General method for hashing and verifying.
 * @param {string} mode - Either 'hash' or 'verify'.
 * @param {string} data - The data to hash or verify.
 * @param {string} [hash] - The hash to compare against (required for 'verify').
 * @returns {Promise<string | boolean>} - The hashed value or verification result.
 */
export const processBcrypt = async (
  mode: "hash" | "verify",
  data: string,
  hash?: string
): Promise<string | boolean> => {
  if (mode === "hash") {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(data, salt);
  } else if (mode === "verify") {
    if (!hash) {
      throw new Error("Hash is required for verification.");
    }
    return await bcrypt.compare(data, hash);
  } else {
    throw new Error('Invalid mode. Use "hash" or "verify".');
  }
};
