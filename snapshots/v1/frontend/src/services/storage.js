const LEGACY_KEYS = ['dfreshy:auth', 'dfreshy:cart', 'dfreshy:addresses']

if (typeof window !== 'undefined' && window.localStorage) {
	LEGACY_KEYS.forEach((key) => window.localStorage.removeItem(key))
}

let inMemoryAuth = null
let inMemoryCart = []
let inMemoryAddresses = []

export const getStoredAuth = () => inMemoryAuth

export const storeAuth = (value) => {
	inMemoryAuth = value || null
}

export const clearAuth = () => {
	inMemoryAuth = null
}

export const getStoredCart = () => inMemoryCart

export const storeCart = (value) => {
	inMemoryCart = Array.isArray(value) ? value : []
}

export const clearCart = () => {
	inMemoryCart = []
}

export const getStoredAddresses = () => inMemoryAddresses

export const storeAddresses = (value) => {
	inMemoryAddresses = Array.isArray(value) ? value : []
}

