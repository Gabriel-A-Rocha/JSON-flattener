import fs from "fs";
import { join } from "path";

enum TYPE {
  PRIMITIVE = "Primitive",
  OBJECT = "Object",
  ARRAY = "Array",
}

class FlattenJSONService {
  flattenAttributes: string[];
  separator: string;

  constructor() {
    this.flattenAttributes = [];
    this.separator = ",";
  }

  execute(filePath: string, separator: string) {
    const importedJSON = require(filePath);
    this.separator = separator;

    this.flattenObject(importedJSON);

    const response = [...this.flattenAttributes];

    this.deleteImportedJSON(filePath);

    const resultsFilePath = join(__dirname, "..", "tmp", "results.txt");
    this.saveResultsTxtFile(response, resultsFilePath);

    return response;
  }

  saveResultsTxtFile(flattenAttrs: string[], filePath: string) {
    let file = fs.createWriteStream(filePath);
    file.on("error", function (err) {
      /* error handling */
    });
    flattenAttrs.forEach(function (v) {
      file.write(v + "\n");
    });
    file.end();
  }

  deleteImportedJSON(filePath: string) {
    fs.unlinkSync(filePath);
  }

  flattenObject(obj: any, attributesArray: string[] = []) {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      const valueType = this.detectValueType(value);

      if (valueType === TYPE.PRIMITIVE) {
        attributesArray.push(key);
        attributesArray.push(`"` + this.stringify(value) + `"`);
        this.flattenAttributes.push(attributesArray.join(this.separator));
        attributesArray.pop();
        attributesArray.pop();
      }

      if (valueType === TYPE.ARRAY) {
        attributesArray.push(key);
        this.flattenObject(value, attributesArray);
        attributesArray.pop();
      }

      if (valueType === TYPE.OBJECT) {
        attributesArray.push(key);
        this.flattenObject(value, attributesArray);
        attributesArray.pop();
      }
    });
  }

  stringify(value: any): string {
    if (value === null) {
      return "null";
    }
    return value;
  }

  detectValueType(value: any): string {
    if (Array.isArray(value)) {
      return TYPE.ARRAY;
    } else if (value && typeof value === "object") {
      return TYPE.OBJECT;
    }
    return TYPE.PRIMITIVE;
  }
}

export { FlattenJSONService };
