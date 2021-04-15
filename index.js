"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var multer_1 = __importDefault(require("multer"));
var path_1 = require("path");
var fs_1 = __importDefault(require("fs"));
var app = express_1.default();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static("public"));
app.set("view engine", "ejs");
var storage = multer_1.default.diskStorage({
    destination: "./tmp",
    filename: function (req, file, cb) {
        var date = Date.now().toString();
        cb(null, date + ".json");
    },
});
var upload = multer_1.default({ storage: storage });
var TYPE;
(function (TYPE) {
    TYPE["PRIMITIVE"] = "Primitive";
    TYPE["OBJECT"] = "Object";
    TYPE["ARRAY"] = "Array";
})(TYPE || (TYPE = {}));
var flattenAttributes = [];
var separators = [".", "..", "...", "-", "--", "---", "_", "__", "___", "|", "/"];
var separator = ".";
app.get("/", function (req, res) {
    return res.render("main", { separators: separators });
});
app.post("/json-upload", upload.single("file"), function (req, res) {
    try {
        var file = req.file;
        separator = req.body.separator;
        var filePath = path_1.join(__dirname, "tmp", file.filename);
        var inputJSON = require(filePath);
        handleObject(inputJSON);
        var response = __spreadArray([], flattenAttributes);
        flattenAttributes = [];
        fs_1.default.unlinkSync(filePath);
        return res.render("results", { flattenAttributes: response });
    }
    catch (error) {
        console.log(error);
        res.render("error");
    }
});
function handleObject(obj, attributesArray) {
    if (attributesArray === void 0) { attributesArray = []; }
    Object.keys(obj).forEach(function (key) {
        var value = obj[key];
        var valueType = detectValueType(value);
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
function detectValueType(value) {
    if (Array.isArray(value)) {
        return TYPE.ARRAY;
    }
    else if (value && typeof value === "object") {
        return TYPE.OBJECT;
    }
    return TYPE.PRIMITIVE;
}
var port = process.env.PORT || 3000;
app.listen(port, function () { return "Server running at port " + port; });
