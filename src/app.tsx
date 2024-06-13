import { Route, Router } from "@solidjs/router"

import Construct from "#routes/construct"
import Scrolls from "#routes/scrolls"

import "./index.css"
import AppLayout from "./layouts/app"

export default function App() {
	return (
		<Router root={AppLayout}>
			<Route path="/" component={Scrolls} />
			<Route path="/construct" component={Construct} />
		</Router>
	)
}
