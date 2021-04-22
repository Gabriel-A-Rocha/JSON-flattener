import { Request, Response } from "express";
import { join } from "path";
import { FlattenJSONService } from "./FlattenJSONService";
import fs from "fs";

class FlattenJSONController {
  constructor() {}

  handle(req: Request, res: Response) {
    const { separator, textarea } = req.body;

    const flattenJSONService = new FlattenJSONService();

    if (textarea) {
      const importedJSON = JSON.parse(textarea);
      const flattenAttributes = flattenJSONService.execute(importedJSON, separator);
      return res.render("results", { flattenAttributes: flattenAttributes });
    }

    const { file } = req;

    if (file) {
      const filePath = join(__dirname, "..", "tmp", file.filename);
      const importedJSON = require(filePath);
      const flattenAttributes = flattenJSONService.execute(importedJSON, separator);
      fs.unlinkSync(filePath);
      return res.render("results", { flattenAttributes: flattenAttributes });
    }

    return res.redirect("/");
  }
}

export { FlattenJSONController };
