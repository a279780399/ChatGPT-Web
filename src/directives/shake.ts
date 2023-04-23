import type { DirectiveBinding } from 'vue'

interface ShakeElement extends HTMLElement {
	style: CSSStyleDeclaration & {
		transform?: string
	}
}

function shake(el: ShakeElement) {
	const shakeTime = 100
	const shakeGap = 10
	let startX = 0
	const originX = el.style.transform

	function shakeStep(timestamp: number) {
		if (!startX)
			startX = timestamp
		const progress = timestamp - startX
		el.style.transform = `translateX(${Math.sin(progress / shakeTime * Math.PI * 2) * shakeGap}px)`
		if (progress < shakeTime)
			window.requestAnimationFrame(shakeStep)
		else
			el.style.transform = originX
	}

	window.requestAnimationFrame(shakeStep)
}

export default {
	mounted(el: ShakeElement, binding: DirectiveBinding<unknown>) {
		if (binding.value)
			shake(el)
	},
}
