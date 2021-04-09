import express from "express";
import multer from "multer";

const app = express();

const memory = multer.memoryStorage();
const fileSizeLimit = 1 * 1024 * 1024; // 1 MB
const upload = multer({ storage: memory, limits: { fileSize: fileSizeLimit } });

app.post("/json-upload", upload.single("file"), (req, res) => {
  const { file } = req;

  console.log(file);

  return res.status(200).send();
});

const port = 3000;
app.listen(port, () => `Server running at port ${port}`);
