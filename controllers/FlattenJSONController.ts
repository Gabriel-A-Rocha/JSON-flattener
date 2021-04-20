import { Request, Response } from "express";
import { join } from "path";
import { FlattenJSONService } from "./FlattenJSONService";

class FlattenJSONController {
  constructor() {}

  handle(req: Request, res: Response) {
    const { file } = req;
    const { separator } = req.body;

    const filePath = join(__dirname, "..", "tmp", file.filename);

    const flattenJSONService = new FlattenJSONService();

    const flattenAttributes = flattenJSONService.execute(filePath, separator);

    return res.render("results", { flattenAttributes: flattenAttributes });
  }
}

export { FlattenJSONController };
