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

  const inputJSON = require(filePath);

  const keys = Object.keys(inputJSON);

  const flattenAttributes: string[] = [];

  keys.forEach((key) => {
    const value = inputJSON[key];

    let attrString = key;

    if (isArray(value)) {
      console.log(`${key} --> Array`);
    } else if (isObject(value)) {
      console.log(`${key} --> Object`);

      attrString = attrString + "." + completeAttrString(value, attrString);
    }

    flattenAttributes.push(attrString);
  });

  return res.status(200).json(flattenAttributes);
});

function isArray(attr: any): boolean {
  return Array.isArray(attr);
}

function isObject(attr: any): boolean {
  return typeof attr === "object";
}

function completeAttrString(obj: any, attrString: string): string {
  const keys = Object.keys(obj);

  if (keys) {
    keys.forEach((key) => {
      const value = obj[key];

      if (isArray(value)) {
        attrString = attrString + "." + key;
        return attrString;
      } else if (isObject(value)) {
        attrString = attrString + "." + completeAttrString(value, attrString);
        return attrString;
      }

      attrString = attrString + "." + key;
      return attrString;
    });
  }

  return "";
}

const port = 3000;
app.listen(port, () => `Server running at port ${port}`);
