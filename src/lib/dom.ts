export function htmlToFragment(html: string) {
	const template = document.createElement("template")
	const fragment = document.createDocumentFragment()

	template.innerHTML = html.trim()
	template.content.childNodes.forEach((el) => void fragment.appendChild(el))

	return fragment
}

export function htmlToElement(html: string) {
	const template = document.createElement("template")
	const div = document.createElement("div")

	template.innerHTML = html.trim()
	template.content.childNodes.forEach((el) => void div.appendChild(el))

	const firstChild = div.firstElementChild

	if (!(firstChild instanceof HTMLElement)) {
		throw new Error("No valid HTML Child")
	}

	return firstChild
}
