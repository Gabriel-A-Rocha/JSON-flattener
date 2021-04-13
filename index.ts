import express from "express";
import multer from "multer";
import { join } from "path";
import fs from "fs";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set("view engine", "ejs");

const storage = multer.diskStorage({
  destination: "./tmp",
  filename: (req, file, cb) => {
    const date = Date.now().toString();
    cb(null, `${date}.json`);
  },
});

const upload = multer({ storage });

enum TYPE {
  PRIMITIVE = "Primitive",
  OBJECT = "Object",
  ARRAY = "Array",
}

let flattenAttributes: string[] = [];

const separators = [".", "..", "...", "-", "--", "---", "_", "__", "___", "|", "/"];
let separator = ".";

app.get("/", (req, res) => {
  return res.render("main", { separators: separators });
});

app.post("/json-upload", upload.single("file"), (req, res) => {
  try {
    const { file } = req;
    separator = req.body.separator;

    const filePath = join(__dirname, "tmp", file.filename);

    const inputJSON = require(filePath);

    handleObject(inputJSON);

    const response = [...flattenAttributes];

    flattenAttributes = [];

    fs.unlinkSync(filePath);

    console.log("Operation successful.");

    return res.render("results", { flattenAttributes: response });
  } catch (error) {
    console.log(error);
    res.render("error");
  }
});

function handleObject(obj: any, attributesArray: string[] = []) {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    const valueType = detectValueType(value);

    if (valueType === TYPE.PRIMITIVE) {
      attributesArray.push(key);
      flattenAttributes.push(attributesArray.join(separator));
      attributesArray.pop();
    }

    if (valueType === TYPE.ARRAY) {
      attributesArray.push(key);
      // flattenAttributes.push(attributesArray.join("."));
      handleObject(value, attributesArray);
      attributesArray.pop();
    }

    if (valueType === TYPE.OBJECT) {
      attributesArray.push(key);
      handleObject(value, attributesArray);
      attributesArray.pop();
    }
  });
}

function detectValueType(value: any): string {
  if (Array.isArray(value)) {
    return TYPE.ARRAY;
  } else if (value && typeof value === "object") {
    return TYPE.OBJECT;
  }
  return TYPE.PRIMITIVE;
}

const port = 3000;
app.listen(port, () => `Server running at port ${port}`);
