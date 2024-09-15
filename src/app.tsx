import { Route, HashRouter } from "@solidjs/router"

import Construct from "#pages/construct"
import Scrolls from "#pages/scrolls"
import Scrollsgpu from "#pages/scrollsgpu"

import "./index.css"

import AppLayout from "./layouts/app"

export default function App() {
	return (
		<HashRouter root={AppLayout}>
			<Route path="/" component={Scrolls} />
			<Route path="/gpu" component={Scrollsgpu} />
			<Route path="/construct" component={Construct} />
		</HashRouter>
	)
}
