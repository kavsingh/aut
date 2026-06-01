import { Route, HashRouter } from "@solidjs/router"

import { Construct } from "~/pages/construct"
import { Scrolls } from "~/pages/scrolls"
import { WgpuConstruct } from "~/pages/wgpu-construct"
import { WgpuGol } from "~/pages/wgpu-gol"
import { WgpuScrolls } from "~/pages/wgpu-scrolls"

import "./index.css"
import { App as AppLayout } from "./layouts/app"

export function App() {
	return (
		<HashRouter root={AppLayout}>
			<Route path="/" component={Scrolls} />
			<Route path="/wgpu-scrolls" component={WgpuScrolls} />
			<Route path="/wgpu-construct" component={WgpuConstruct} />
			<Route path="/wgpu-gol" component={WgpuGol} />
			<Route path="/construct" component={Construct} />
		</HashRouter>
	)
}
