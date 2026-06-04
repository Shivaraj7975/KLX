import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)

const normalizeItem = (item) => ({
  id: item.id,
  name: item.name,
  size: item.size,
  price: Number(item.price || 0),
  quantity: Number(item.quantity || 1),
})

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])
  const { isAuthenticated } = useAuth()

  const updateState = (nextItems) => {
    setItems(nextItems)
  }

  const addItem = (item) => {
    const normalized = normalizeItem(item)
    const existing = items.find((entry) => entry.id === normalized.id)
    if (existing) {
      updateState(
        items.map((entry) =>
          entry.id === normalized.id
            ? { ...entry, quantity: entry.quantity + normalized.quantity }
            : entry
        )
      )
      return
    }
    updateState([...items, normalized])
  }

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      updateState(items.filter((entry) => entry.id !== id))
      return
    }
    updateState(
      items.map((entry) => (entry.id === id ? { ...entry, quantity } : entry))
    )
  }

  const removeItem = (id) => {
    updateState(items.filter((entry) => entry.id !== id))
  }

  const clear = () => {
    updateState([])
  }

  useEffect(() => {
    if (!isAuthenticated && items.length > 0) {
      clear()
    }
  }, [isAuthenticated, items.length])

  const total = items.reduce(
    (sum, entry) => sum + entry.price * entry.quantity,
    0
  )

  const value = useMemo(
    () => ({ items, addItem, updateQuantity, removeItem, clear, total }),
    [items, total]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
