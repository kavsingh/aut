type BootFn = (
	canvases: HTMLCanvasElement[],
	thumbnailsContainer: HTMLElement,
) => void

interface Window {
	bootApp: BootFn
}
