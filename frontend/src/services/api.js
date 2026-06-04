import { getStoredAuth } from './storage.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const clone = (value) => JSON.parse(JSON.stringify(value))

const createListingImage = (listing) => ({
  bg: 'linear-gradient(135deg, #eaf1ff, #d7e3ff)',
  label: listing.name?.slice(0, 2)?.toUpperCase() || 'CS',
  url: listing.imageUrl || '',
  alt: listing.name || 'Campus listing',
})

const normalizeListing = (entry) => ({
  id: entry._id || entry.id,
  name: entry.name || 'Untitled listing',
  category: entry.category || 'Books',
  size: entry.category || 'Books',
  condition: entry.condition || 'Good',
  price: Number(entry.price || 0),
  availableQuantity: Number(entry.availableQuantity || 1),
  description: entry.description || '',
  campus: entry.campus || entry.sellerCampus || '',
  college: entry.sellerCampus || entry.campus || '',
  sellerId: typeof entry.sellerId === 'object' ? entry.sellerId?._id || entry.sellerId?.id : entry.sellerId || '',
  sellerName: entry.sellerName || 'Student seller',
  sellerPhone: entry.sellerPhone || '',
  sellerEmail: entry.sellerEmail || '',
  createdAt: entry.createdAt || entry.updatedAt || new Date().toISOString(),
  status: entry.active === false ? 'INACTIVE' : 'ACTIVE',
  approvalStatus: entry.approvalStatus || (entry.approved ? 'APPROVED' : 'PENDING'),
  approved: Boolean(entry.approved),
  image: createListingImage(entry),
  videoUrl: entry.videoUrl || '',
  highlights: entry.highlights || [],
  contactRequests: Array.isArray(entry.contactRequests)
    ? entry.contactRequests.map((contact) => ({
        id: contact._id || contact.id,
        buyerId: typeof contact.buyerId === 'object' ? contact.buyerId?._id || contact.buyerId?.id : contact.buyerId || '',
        buyerName: contact.buyerName || 'Buyer',
        buyerPhone: contact.buyerPhone || '',
        buyerEmail: contact.buyerEmail || '',
        note: contact.note || '',
        status: contact.status || 'OPEN',
        dealDoneAt: contact.dealDoneAt || null,
        createdAt: contact.createdAt || new Date().toISOString(),
      }))
    : [],
  specs: {
    condition: entry.condition || 'Good',
    pickup: entry.campus || entry.sellerCampus || '',
    seller: entry.sellerName || 'Student seller',
  },
  reviews: entry.reviews || [],
})

const normalizeRequestResponse = (response) => ({
  id: response._id || response.id || `response-${Date.now()}`,
  responderId: typeof response.sellerId === 'object' ? response.sellerId?._id || response.sellerId?.id : response.sellerId || response.responderId || '',
  responderName: response.sellerName || response.responderName || 'Student seller',
  responderPhone: response.sellerPhone || response.responderPhone || '',
  responderEmail: response.sellerEmail || response.responderEmail || '',
  message: response.message || '',
  price: response.price ?? null,
  createdAt: response.respondedAt || response.createdAt || new Date().toISOString(),
})

const normalizeRequest = (entry) => ({
  id: entry._id || entry.id,
  name: entry.name || 'Product request',
  category: entry.category || 'Books',
  description: entry.description || '',
  budget: entry.budget ?? '',
  campus: entry.campus || entry.requesterCampus || '',
  college: entry.requesterCampus || entry.campus || '',
  requesterId: typeof entry.requesterId === 'object' ? entry.requesterId?._id || entry.requesterId?.id : entry.requesterId || '',
  requesterName: entry.requesterName || 'Campus member',
  requesterPhone: entry.requesterPhone || '',
  requesterEmail: entry.requesterEmail || '',
  createdAt: entry.createdAt || entry.updatedAt || new Date().toISOString(),
  status: entry.active === false ? 'CLOSED' : 'OPEN',
  responses: Array.isArray(entry.responses) ? entry.responses.map(normalizeRequestResponse) : [],
})

const getAuth = () => getStoredAuth()

const requestJson = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.message || payload.error || 'Request failed')
  }

  return payload
}

const getProfile = async (tokenOverride) => {
  const auth = getAuth()
  const payload = await requestJson('/auth/profile', {
    token: tokenOverride || auth?.token,
  })

  return payload.user || null
}

const loginWithPassword = async (payload) => {
  const response = await requestJson('/auth/login', {
    method: 'POST',
    body: {
      email: payload.email,
      password: payload.password,
    },
  })

  return {
    token: response.token,
    user: {
      ...response.user,
      college: response.user?.campus || response.user?.college || payload.college || 'Campus',
    },
  }
}

const sendOtp = async (payload) => {
  return requestJson('/auth/send-otp', {
    method: 'POST',
    body: {
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      password: payload.password,
      campus: payload.college || payload.campus,
    },
  })
}

const verifyOtp = async (payload) => {
  const response = await requestJson('/auth/verify-otp', {
    method: 'POST',
    body: {
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      otp: payload.otp,
      password: payload.password,
      campus: payload.college || payload.campus,
    },
  })

  return {
    token: response.token,
    user: {
      ...response.user,
      college: response.user?.campus || response.user?.college || payload.college || 'Campus',
    },
  }
}

const loginCampusUser = loginWithPassword

const getAllListings = async () => {
  const payload = await requestJson('/listings')
  return clone((payload.listings || []).map(normalizeListing))
}

const getActiveListings = async () => getAllListings()

const getListingById = async (id) => {
  const auth = getAuth()
  const payload = await requestJson(`/listings/${id}`, {
    token: auth?.token,
  })
  return payload.listing ? clone(normalizeListing(payload.listing)) : null
}

const getMyListings = async (tokenOverride) => {
  const auth = getAuth()
  const token = tokenOverride || auth?.token
  if (!token) {
    return []
  }

  const payload = await requestJson('/listings/mine', { token })
  return clone((payload.listings || []).map(normalizeListing))
}

const createListing = async (payload) => {
  const auth = getAuth()
  if (!auth?.token) {
    throw new Error('Login required to post a listing.')
  }

  const response = await requestJson('/listings', {
    method: 'POST',
    token: auth.token,
    body: {
      name: payload.name,
      category: payload.category,
      condition: payload.condition,
      price: payload.price,
      availableQuantity: payload.availableQuantity,
      description: payload.description,
      campus: payload.campus,
      imageUrl: payload.imageUrl,
      videoUrl: payload.videoUrl,
    },
  })

  return clone(normalizeListing(response.listing))
}

const updateListing = async (id, payload) => {
  const auth = getAuth()
  if (!auth?.token) {
    throw new Error('Login required.')
  }

  const response = await requestJson(`/listings/${id}`, {
    method: 'PUT',
    token: auth.token,
    body: {
      ...payload,
      role: auth.user?.role,
    },
  })

  return response.listing ? clone(normalizeListing(response.listing)) : null
}

const updateMyListing = updateListing

const deleteListing = async (id) => {
  const auth = getAuth()
  if (!auth?.token) {
    throw new Error('Login required.')
  }

  await requestJson(`/listings/${id}`, {
    method: 'DELETE',
    token: auth.token,
    body: { role: auth.user?.role },
  })

  return true
}

const getAdminListings = async (tokenOverride) => {
  const auth = getAuth()
  const token = tokenOverride || auth?.token
  const payload = await requestJson('/admin/listings', { token })
  return clone((payload.listings || []).map(normalizeListing))
}

const approveListing = async (id, approved = true) => {
  const auth = getAuth()
  const response = await requestJson(`/admin/listings/${id}/approve`, {
    method: 'PATCH',
    token: auth?.token,
    body: { approved },
  })
  return response.listing ? clone(normalizeListing(response.listing)) : null
}

const deleteAdminListing = async (id) => {
  const auth = getAuth()
  await requestJson(`/admin/listings/${id}`, {
    method: 'DELETE',
    token: auth?.token,
  })
  return true
}

const getRequests = async () => {
  const payload = await requestJson('/requests')
  return clone((payload.requests || []).map(normalizeRequest))
}

const getRequestById = async (id) => {
  const payload = await requestJson(`/requests/${id}`)
  return payload.request ? clone(normalizeRequest(payload.request)) : null
}

const getMyRequests = async () => {
  const requests = await getRequests()
  const auth = getAuth()
  const userId = auth?.user?.id
  if (!userId) {
    return []
  }

  return requests.filter((request) => request.requesterId === userId)
}

const createRequest = async (payload) => {
  const auth = getAuth()
  if (!auth?.token) {
    throw new Error('Login required to post a request.')
  }

  const response = await requestJson('/requests', {
    method: 'POST',
    token: auth.token,
    body: {
      name: payload.name,
      category: payload.category,
      budget: payload.budget,
      description: payload.description,
      campus: payload.campus,
      requesterName: auth.user?.name,
      requesterPhone: auth.user?.phone,
      requesterEmail: auth.user?.email,
    },
  })

  return clone(normalizeRequest(response.request))
}

const addRequestResponse = async (requestId, responseData) => {
  const auth = getAuth()
  if (!auth?.token) {
    throw new Error('Login required to respond.')
  }

  const response = await requestJson(`/requests/${requestId}/respond`, {
    method: 'POST',
    token: auth.token,
    body: {
      message: responseData.message,
      price: responseData.price,
      sellerName: auth.user?.name,
      sellerPhone: auth.user?.phone,
      sellerEmail: auth.user?.email,
    },
  })

  return response.request ? clone(normalizeRequest(response.request)) : null
}

const contactSeller = async (listingId, note = '') => {
  const auth = getAuth()
  if (!auth?.token) {
    throw new Error('Login required to contact a seller.')
  }

  const response = await requestJson(`/listings/${listingId}/contact`, {
    method: 'POST',
    token: auth.token,
    body: { note },
  })

  return response.contact || null
}

const getListingContacts = async (listingId) => {
  const auth = getAuth()
  const response = await requestJson(`/listings/${listingId}/contacts`, { token: auth?.token })
  return response.contacts || []
}

const markDealDone = async (listingId, contactId) => {
  const auth = getAuth()
  const response = await requestJson(`/listings/${listingId}/deal-done`, {
    method: 'POST',
    token: auth?.token,
    body: { contactId },
  })
  return response.listing ? clone(normalizeListing(response.listing)) : null
}

const getUsers = async (tokenOverride) => {
  const auth = getAuth()
  const token = tokenOverride || auth?.token
  const response = await requestJson('/admin/users', { token })
  return clone(response.users || [])
}

const updateUserRole = async (userId, newRole) => {
  const auth = getAuth()
  const response = await requestJson(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    token: auth?.token,
    body: { role: newRole },
  })
  return response.user || null
}

const updateUserStatus = async (userId, newStatus) => {
  const auth = getAuth()
  const blocked = newStatus !== 'ACTIVE'
  const response = await requestJson(`/admin/users/${userId}/block`, {
    method: 'PATCH',
    token: auth?.token,
    body: { blocked },
  })
  return response.user || null
}

const toggleUserBlock = async (userId, blocked) => {
  const auth = getAuth()
  const response = await requestJson(`/admin/users/${userId}/block`, {
    method: 'PATCH',
    token: auth?.token,
    body: { blocked },
  })
  return response.user || null
}

const toggleUserSellBlock = async (userId, blockedSell) => {
  const auth = getAuth()
  const response = await requestJson(`/admin/users/${userId}/block-sell`, {
    method: 'PATCH',
    token: auth?.token,
    body: { blockedSell },
  })
  return response.user || null
}

const toggleUserBuyBlock = async (userId, blockedBuy) => {
  const auth = getAuth()
  const response = await requestJson(`/admin/users/${userId}/block-buy`, {
    method: 'PATCH',
    token: auth?.token,
    body: { blockedBuy },
  })
  return response.user || null
}

const getDashboardStats = async () => {
  const [listings, users] = await Promise.all([getAdminListings(), getUsers()])
  return [
    { label: 'Listings', value: String(listings.length) },
    { label: 'Users', value: String(users.length) },
    { label: 'Pending listings', value: String(listings.filter((listing) => listing.approvalStatus === 'PENDING').length) },
  ]
}

const updateRequestStatus = async () => null
const getActivityLogs = async () => []
const getDefaultOrders = async () => []
const getDefaultZones = async () => []

export const api = {
  getProfile,
  loginCampusUser,
  loginWithPassword,
  sendOtp,
  verifyOtp,
  getListings: getActiveListings,
  getPublicProducts: getActiveListings,
  getListingById,
  getMyListings,
  createListing,
  updateListing,
  updateMyListing,
  deleteListing,
  getUsers,
  toggleUserBlock,
  toggleUserSellBlock,
  toggleUserBuyBlock,
  getDashboardStats,
  getAdminStats: () => getDashboardStats(),
  getActivityLogs,
  getAdminLogs: () => getActivityLogs(),
  getAdminProducts: getAdminListings,
  getPublicProductsById: getListingById,
  createProduct: createListing,
  updateProduct: updateListing,
  deleteProduct: deleteAdminListing,
  approveListing,
  deleteAdminListing,
  contactSeller,
  getListingContacts,
  markDealDone,
  updateUserRole,
  updateUserStatus,
  createCustomerOrder: async () => ({ success: true, orderId: 'NA' }),
  getCustomerOrders: async () => getDefaultOrders(),
  getManagerOrders: async () => getDefaultOrders(),
  getDeliveryOrders: async () => getDefaultOrders(),
  getServiceZones: async () => getDefaultZones(),
  updateZoneStatus: async () => ({ success: true }),
  createServiceZone: async (data) => ({ id: `zone-${Date.now()}`, ...data }),
  getAdminProductsLegacy: getAllListings,
  getPublicProductsLegacy: getActiveListings,
  getAdminLogsLegacy: async () => [],
  getAdminStatsLegacy: async () => [],
  getLegacyOrders: async () => [],
  getLegacyManagerOrders: async () => [],
  getLegacyDeliveryOrders: async () => [],
  getLegacyServiceZones: async () => [],
  getRequests,
  getRequestById,
  getMyRequests,
  createRequest,
  updateRequestStatus,
  addRequestResponse,
}
