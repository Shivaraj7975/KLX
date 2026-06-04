import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { api } from '../services/api.js'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [nextListings, nextUsers] = await Promise.all([api.getAdminProducts(), api.getUsers()])
      setListings(nextListings)
      setUsers(nextUsers)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleApprove = async (id) => {
    await api.approveListing(id, true)
    await loadData()
  }

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Delete this listing permanently?')) {
      return
    }
    await api.deleteAdminListing(id)
    await loadData()
  }

  const handleBlockUser = async (id, blocked) => {
    await api.toggleUserBlock(id, blocked)
    await loadData()
  }

  const handleBlockSeller = async (id, blockedSell) => {
    await api.toggleUserSellBlock(id, blockedSell)
    await loadData()
  }

  const handleBlockBuyer = async (id, blockedBuy) => {
    await api.toggleUserBuyBlock(id, blockedBuy)
    await loadData()
  }

  return (
    <div className="container">
      <section className="section section--tight">
        <span className="pill">Admin control</span>
        <h1>Admin dashboard</h1>
        <p className="muted">Manage listings, approve new products, and block accounts when needed.</p>
        <p className="muted">Signed in as {user?.name}</p>
      </section>

      {loading ? (
        <div className="card">Loading admin data...</div>
      ) : (
        <>
          <section className="section">
            <div className="section__header">
              <h2>Listings</h2>
              <span className="muted">{listings.length} total</span>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {listings.map((listing) => (
                <div key={listing.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                      <h3>{listing.name}</h3>
                      <p className="muted">{listing.category} • {listing.sellerName} • Qty {listing.availableQuantity}</p>
                      <p className="muted">Approval: {listing.approvalStatus || 'PENDING'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button className="button" type="button" onClick={() => handleApprove(listing.id)} disabled={listing.approved}>
                        {listing.approved ? 'Approved' : 'Approve'}
                      </button>
                      <button className="button ghost" type="button" onClick={() => handleDeleteListing(listing.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="section__header">
              <h2>Users</h2>
              <span className="muted">{users.length} total</span>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {users.map((member) => (
                <div key={member.id || member._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                      <h3>{member.name}</h3>
                      <p className="muted">{member.email} • {member.phone}</p>
                      <p className="muted">Role: {member.role}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button className="button ghost" type="button" onClick={() => handleBlockUser(member.id || member._id, !member.blocked)}>
                        {member.blocked ? 'Unblock account' : 'Block account'}
                      </button>
                      <button className="button ghost" type="button" onClick={() => handleBlockSeller(member.id || member._id, !member.blockedSell)}>
                        {member.blockedSell ? 'Allow selling' : 'Block selling'}
                      </button>
                      <button className="button ghost" type="button" onClick={() => handleBlockBuyer(member.id || member._id, !member.blockedBuy)}>
                        {member.blockedBuy ? 'Allow buying' : 'Block buying'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default AdminDashboard