const fs = require("fs");
const { file } = require("pdfkit");

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log(err);
      throw err;
    }
  });
};

exports.deleteFile = deleteFile;
