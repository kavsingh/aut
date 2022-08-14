export const htmlToFragment = (html: string) => {
	const template = document.createElement('template')
	const fragment = document.createDocumentFragment()

	template.innerHTML = html.trim()

	const els = template.content.childNodes

	els.forEach((el) => void fragment.appendChild(el))

	return fragment
}

export const htmlToElement = (html: string) => {
	const template = document.createElement('template')
	const div = document.createElement('div')

	template.innerHTML = html.trim()

	const els = template.content.childNodes

	els.forEach((el) => void div.appendChild(el))

	const firstChild = div.firstElementChild

	if (!(firstChild instanceof HTMLElement)) {
		throw new Error('No valid HTML Child')
	}

	return firstChild
}
