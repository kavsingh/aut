import './style/global-style.css'
// import WorldScrolls from './screens/world-scrolls'
import Construct from './screens/construct'

const app = (rootEl: HTMLElement) => {
	const { el } = Construct({})

	rootEl.appendChild(el)
}

const appRoot = document.getElementById('app-root')

if (!appRoot) throw new Error('Could not find #app-root')

app(appRoot)
