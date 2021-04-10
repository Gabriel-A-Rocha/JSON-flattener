import express, { Request } from "express";
import multer from "multer";
import { join } from "path";

const app = express();

app.use(express.json());

const storage = multer.diskStorage({
  destination: "./tmp",
  filename: (req, file, cb) => {
    cb(null, `data.json`);
  },
});

const upload = multer({ storage });

app.post("/json-upload", upload.single("file"), (req, res) => {
  const { file } = req;

  const filePath = join(__dirname, "tmp", file.filename);

  const data1 = require(filePath);
  const data = data1.formContent;

  //let newData: string[] = [];

  for (const prop in data) {
    if (Array.isArray(data[prop])) {
      console.log(`${prop} is an array!`);
    } else if (typeof data[prop] === "object") {
      console.log(`${prop} is an object!`);
    } else {
      console.log(`${prop} is a property!`);
    }
  }

  return res.status(200).json(data);
});

const port = 3000;
app.listen(port, () => `Server running at port ${port}`);
