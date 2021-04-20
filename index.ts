import express from "express";
import multer from "multer";
import { FlattenJSONController } from "./controllers/FlattenJSONController";
import { join } from "path";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use(express.static("tmp"));

app.set("view engine", "ejs");

const storage = multer.diskStorage({
  destination: "./tmp",
  filename: (req, file, cb) => {
    const date = Date.now().toString();
    cb(null, `${date}.json`);
  },
});

const upload = multer({ storage });

app.get("/", (req, res) => {
  const separators = [".", "|", "/", "..", "...", "-", "--", "---", "_", "__", "___"];

  return res.render("main", { separators: separators });
});

app.post("/json-upload", upload.single("file"), (req, res) => {
  try {
    const flattenJSONController = new FlattenJSONController();

    return flattenJSONController.handle(req, res);
  } catch (error) {
    return res.render("error");
  }
});

app.get("/results", (req, res) => {
  const filePath = join(__dirname, "tmp", "results.txt");
  return res.download(filePath);
});

const port = process.env.PORT || 3000;
app.listen(port, () => `Server running at port ${port}`);
