/**
 * Detects product category based on item name keywords
 * Returns category name if match found, null otherwise
 */

const categoryKeywords = {
  Books: [
    'book', 'pen', 'notebook', 'journal', 'notes', 'novel', 'text', 'guide',
    'manual', 'publication', 'paper', 'notepad', 'stationery', 'pencil',
    'marker', 'eraser', 'ruler', 'sketch'
  ],
  Electronics: [
    'charger', 'adapter', 'cable', 'phone', 'laptop', 'headphone', 'earphone',
    'mouse', 'keyboard', 'monitor', 'screen', 'tablet', 'usb', 'power', 'battery',
    'speaker', 'microphone', 'camera', 'watch', 'device', 'electronic'
  ],
  Transport: [
    'bike', 'cycle', 'bicycle', 'scooter', 'skateboard', 'roller', 'skate',
    'helmet', 'vehicle', 'transport'
  ],
  Accessories: [
    'bag', 'wallet', 'watch', 'ring', 'necklace', 'bracelet', 'earring', 'pendant',
    'glasses', 'sunglasses', 'cap', 'hat', 'scarf', 'belt', 'shoes', 'socks',
    't-shirt', 'shirt', 'cloth', 'apparel', 'garment', 'jacket', 'hoodie', 'sweater'
  ],
  Academic: [
    'calculator', 'compass', 'scale', 'protractor', 'geometry', 'mathematics',
    'science', 'lab', 'equipment', 'tool', 'instrument', 'lens', 'microscope'
  ]
}

export const detectCategory = (itemName) => {
  if (!itemName || typeof itemName !== 'string') {
    return null
  }

  const term = itemName.toLowerCase().trim()

  // Check each category's keywords
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (term.includes(keyword)) {
        return category
      }
    }
  }

  // No match found
  return null
}
