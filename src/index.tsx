import { render } from "solid-js/web"

import App from "./app"

const appRoot = document.getElementById("app-root")

if (!appRoot) throw new Error("#app-root not found")

render(() => <App />, appRoot)
