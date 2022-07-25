export const htmlToFragment = (html: string) => {
	const template = document.createElement('template')
	const fragment = document.createDocumentFragment()

	template.innerHTML = html.trim()

	const els = template.content.childNodes

	els.forEach((el) => void fragment.appendChild(el))

	return fragment
}
