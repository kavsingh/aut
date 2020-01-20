type BootFn = (props: {
	worldCount: number
	worldsContainer: HTMLElement
	thumbnailsContainer: HTMLElement
	snapshotButton: HTMLElement
}) => void

interface Window {
	bootApp: BootFn
}
