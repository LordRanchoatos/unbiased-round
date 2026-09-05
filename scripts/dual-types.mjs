// tsc emits one set of declarations; CommonJS consumers under Node16/NodeNext
// module resolution need them mirrored as .d.cts next to dist/index.cjs.
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";

copyFileSync("dist/index.d.ts", "dist/index.d.cts");
copyFileSync("dist/index.d.ts.map", "dist/index.d.cts.map");
writeFileSync(
  "dist/index.d.cts",
  readFileSync("dist/index.d.cts", "utf8").replace("index.d.ts.map", "index.d.cts.map"),
);
