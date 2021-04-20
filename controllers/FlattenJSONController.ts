import { Request, Response } from "express";
import { join } from "path";
import { FlattenJSONService } from "./FlattenJSONService";
import { FlattenJSONTextareaService } from "./FlattenJSONTextareaService";

class FlattenJSONController {
  constructor() {}

  handle(req: Request, res: Response) {
    const { separator, textarea } = req.body;

    if (textarea) {
      const jsonText = textarea;

      const flattenJSONTextareaService = new FlattenJSONTextareaService();

      const flattenAttributes = flattenJSONTextareaService.execute(jsonText, separator);

      return res.render("results", { flattenAttributes: flattenAttributes });
    }

    const { file } = req;

    const filePath = join(__dirname, "..", "tmp", file.filename);

    const flattenJSONService = new FlattenJSONService();

    const flattenAttributes = flattenJSONService.execute(filePath, separator);

    return res.render("results", { flattenAttributes: flattenAttributes });
  }
}

export { FlattenJSONController };
