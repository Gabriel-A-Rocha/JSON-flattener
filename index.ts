import express, { Request } from "express";
import multer from "multer";
import { join } from "path";
import { FlattenAttributesService } from "./src/Service/FlattenAttributesService";

const app = express();

app.use(express.json());

const storage = multer.diskStorage({
  destination: "./tmp",
  filename: (req, file, cb) => {
    cb(null, `data.json`);
  },
});

const upload = multer({ storage });

enum TYPE {
  PRIMITIVE = "Primitive",
  OBJECT = "Object",
  ARRAY = "Array",
}

const flattenAttributes: string[] = [];

app.post("/json-upload", upload.single("file"), (req, res) => {
  const { file } = req;

  const filePath = join(__dirname, "tmp", file.filename);

  const inputJSON = require(filePath);

  Object.keys(inputJSON).forEach((key) => {
    const attributesArray: string[] = [key];

    const value = inputJSON[key];

    const valueType = detectValueType(value);

    if (valueType === TYPE.PRIMITIVE) {
      flattenAttributes.push(attributesArray[0]);
    }

    if (valueType === TYPE.ARRAY) {
      attributesArray.push("[Array]");
      flattenAttributes.push(attributesArray.join("-"));
    }

    if (valueType === TYPE.OBJECT) {
      handleObject(value, attributesArray);
    }
  });

  return res.status(200).json(flattenAttributes);
});

function handleObject(obj: any, attributesArray: string[]) {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    const valueType = detectValueType(value);

    if (valueType === TYPE.PRIMITIVE) {
      attributesArray.push(key);
      flattenAttributes.push(attributesArray.join("."));
      attributesArray.pop();
    }

    if (valueType === TYPE.ARRAY) {
      attributesArray.push(key + "[Array]");
      flattenAttributes.push(attributesArray.join("."));
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

function isArray(attr: any): boolean {
  return Array.isArray(attr);
}

function isObject(attr: any): boolean {
  return typeof attr === "object";
}

function completeAttrString(obj: any, attrString2 = "") {
  let attrString = attrString2;

  const keys = Object.keys(obj);

  keys.forEach((key, index) => {
    const value = obj[key];

    if (isArray(value)) {
      !attrString
        ? flattenAttributes.push(`${key}[Array]`)
        : flattenAttributes.push(attrString + `.${key}[Array]`);
    } else if (value && isObject(value)) {
      !attrString ? (attrString = attrString + `${key}`) : (attrString = attrString + `.${key}`);
      completeAttrString(value, attrString);
    } else {
      !attrString
        ? flattenAttributes.push(`${key}`)
        : flattenAttributes.push(attrString + `.${key}`);
    }

    if (index === keys.length - 1) {
      attrString = "";
    }
  });

  attrString = "";

  return flattenAttributes;
}

const port = 3000;
app.listen(port, () => `Server running at port ${port}`);
