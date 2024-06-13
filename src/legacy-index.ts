import "./index.css"
import app from "./legacy-app"

const appRoot = document.getElementById("app-root")

if (!appRoot) throw new Error("Could not find #app-root")

app(appRoot)
