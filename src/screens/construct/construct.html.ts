export const screen = /*html*/ `
<div class="flex items-center justify-center w-full h-full">
	<div data-el="world-container" class="relative w-[440px] h-[440px]">
		<div 
			data-el="sliders-container"
			class="absolute inset-0 z-10"
		></div>
		<canvas
			data-el="world-canvas"
			class="absolute inset-0 z-0 bg-white dark:bg-neutral-950"
		></canvas>
	</div>
</div>
<div
	data-el="buttons-container"
	class="absolute flex gap-4 -translate-x-1/2 bottom-[2em] start-1/2"
></div>
`
