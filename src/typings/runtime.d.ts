type BootFn = (
	canvases: NodeListOf<HTMLCanvasElement>,
	thumbnailsContainer: HTMLElement,
) => void

interface Window {
	bootApp: BootFn
}
