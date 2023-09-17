export const html = /* html */ `
<div class="flex items-center justify-center w-full h-full">
	<div class="relative mt-[60px] z-[2] group">
		<div
			data-el="worlds-container"
			class="flex items-center justify-center cursor-pointer"
		></div>
		<div
			data-el="thumbnails-container"
			class="flex items-center justify-center translate-y-[-20%] cursor-pointer opacity-0 transition-all pointer-events-none h-[60px] group-hover:opacity-100 group-hover:translate-y-0"
		></div>
	</div>
	<div
		data-el="buttons-container"
		class="absolute flex gap-4 bottom-[2em] start-1/2 -translate-x-1/2"
	></div>
</div>
`
