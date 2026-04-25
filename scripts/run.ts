// @ts-ignore
import { JSDOM } from "jsdom";
const window = new JSDOM().window;
globalThis.document = window.document;

// @ts-ignore
import * as fs from "fs";
import { getSVG } from "../dist/main.js";

fs.writeFileSync("./build/sample.svg", getSVG().outerHTML);
