type BootFn = (
	canvases: NodeListOf<HTMLCanvasElement>,
	thumbnailsContainer: HTMLElement,
	snapshotButton: HTMLElement,
) => void

interface Window {
	bootApp: BootFn
}
