const LEGACY_KEYS = ['dfreshy:auth', 'dfreshy:cart', 'dfreshy:addresses']
const AUTH_KEY = 'klx:auth'
const CART_KEY = 'klx:cart'
const ADDRESSES_KEY = 'klx:addresses'

if (typeof window !== 'undefined' && window.localStorage) {
	LEGACY_KEYS.forEach((key) => window.localStorage.removeItem(key))
}

let inMemoryAuth = null
let inMemoryCart = []
let inMemoryAddresses = []

const hasLocalStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage)

const readJson = (key, fallback) => {
	if (!hasLocalStorage()) {
		return fallback
	}

	try {
		const raw = window.localStorage.getItem(key)
		return raw ? JSON.parse(raw) : fallback
	} catch {
		return fallback
	}
}

const writeJson = (key, value) => {
	if (!hasLocalStorage()) {
		return
	}

	if (value === null || value === undefined) {
		window.localStorage.removeItem(key)
		return
	}

	window.localStorage.setItem(key, JSON.stringify(value))
}

inMemoryAuth = readJson(AUTH_KEY, null)
inMemoryCart = readJson(CART_KEY, [])
inMemoryAddresses = readJson(ADDRESSES_KEY, [])

export const getStoredAuth = () => inMemoryAuth

export const storeAuth = (value) => {
	inMemoryAuth = value || null
	writeJson(AUTH_KEY, inMemoryAuth)
}

export const clearAuth = () => {
	inMemoryAuth = null
	writeJson(AUTH_KEY, null)
}

export const getStoredCart = () => inMemoryCart

export const storeCart = (value) => {
	inMemoryCart = Array.isArray(value) ? value : []
	writeJson(CART_KEY, inMemoryCart)
}

export const clearCart = () => {
	inMemoryCart = []
	writeJson(CART_KEY, [])
}

export const getStoredAddresses = () => inMemoryAddresses

export const storeAddresses = (value) => {
	inMemoryAddresses = Array.isArray(value) ? value : []
	writeJson(ADDRESSES_KEY, inMemoryAddresses)
}

