const fs = require("fs");

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log("delete file error", err);
      throw err;
    }
  });
};
exports.deleteFile = deleteFile;
