import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))

export const PROJECT_ROOT = path.resolve(__dirname, "../..")
