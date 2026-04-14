import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Home, CalendarCheck, MessageSquare, IndianRupee, Plus, Pencil, Trash2,
  LogOut, X, Loader2, AlertCircle, CheckCircle2, ChevronLeft
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

function getAuthHeaders() {
  const token = localStorage.getItem('admin_token');
  return { Authorization: `Bearer ${token}` };
}

// --- Stats Cards ---
function StatsBar({ stats }) {
  const items = [
    { icon: Home, label: 'Properties', value: stats.properties, color: 'bg-deep-teal' },
    { icon: CalendarCheck, label: 'Bookings', value: stats.bookings, color: 'bg-warm-sand' },
    { icon: MessageSquare, label: 'Inquiries', value: stats.contacts, color: 'bg-teal-hover' },
    { icon: IndianRupee, label: 'Revenue', value: `₹${(stats.revenue || 0).toLocaleString()}`, color: 'bg-deep-teal' },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          data-testid={`stat-${item.label.toLowerCase()}`}
          className="bg-white rounded-xl border border-border-sand p-5"
        >
          <div className={`${item.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
            <item.icon size={18} className="text-white" />
          </div>
          <p className="font-body text-xs text-body-text uppercase tracking-wider">{item.label}</p>
          <p className="font-heading text-2xl font-semibold text-heading mt-1">{item.value}</p>
        </motion.div>
      ))}
    </div>
  );
}

// --- Property Form Modal ---
function PropertyFormModal({ property, onClose, onSave }) {
  const isEdit = !!property;
  const [form, setForm] = useState({
    name: property?.name || '',
    location: property?.location || '',
    price_per_night: property?.price_per_night || '',
    description: property?.description || '',
    amenities: property?.amenities?.join(', ') || '',
    images: property?.images?.join('\n') || '',
    max_guests: property?.max_guests || 6,
    rating: property?.rating || 4.5,
    reviews_count: property?.reviews_count || 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.location || !form.price_per_night || !form.description) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError('');
    const payload = {
      name: form.name,
      location: form.location,
      price_per_night: parseInt(form.price_per_night),
      description: form.description,
      amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
      images: form.images.split('\n').map(u => u.trim()).filter(Boolean),
      max_guests: parseInt(form.max_guests),
      rating: parseFloat(form.rating),
      reviews_count: parseInt(form.reviews_count),
    };
    try {
      if (isEdit) {
        await axios.put(`${API}/api/admin/properties/${property.property_id}`, payload, { headers: getAuthHeaders() });
      } else {
        await axios.post(`${API}/api/admin/properties`, payload, { headers: getAuthHeaders() });
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border-sand">
          <h3 className="font-heading text-xl font-medium text-heading">{isEdit ? 'Edit Property' : 'Add New Property'}</h3>
          <button data-testid="property-form-close" onClick={onClose} className="text-body-text hover:text-heading transition-colors">
            <X size={20} />
          </button>
        </div>
        <form data-testid="property-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-sm text-body-text block mb-1">Property Name *</label>
              <input data-testid="prop-name-input" type="text" value={form.name} onChange={e => handleChange('name', e.target.value)}
                placeholder="e.g. Kochi Marina Retreat"
                className="w-full bg-sand-light border border-border-sand rounded-xl px-4 py-2.5 font-body text-sm text-heading placeholder:text-body-text/40 focus:outline-none focus:ring-2 focus:ring-deep-teal/20 focus:border-deep-teal" />
            </div>
            <div>
              <label className="font-body text-sm text-body-text block mb-1">Location *</label>
              <input data-testid="prop-location-input" type="text" value={form.location} onChange={e => handleChange('location', e.target.value)}
                placeholder="e.g. Near Infopark, Kochi"
                className="w-full bg-sand-light border border-border-sand rounded-xl px-4 py-2.5 font-body text-sm text-heading placeholder:text-body-text/40 focus:outline-none focus:ring-2 focus:ring-deep-teal/20 focus:border-deep-teal" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-body text-sm text-body-text block mb-1">Price/Night (₹) *</label>
              <input data-testid="prop-price-input" type="number" value={form.price_per_night} onChange={e => handleChange('price_per_night', e.target.value)}
                placeholder="3500"
                className="w-full bg-sand-light border border-border-sand rounded-xl px-4 py-2.5 font-body text-sm text-heading placeholder:text-body-text/40 focus:outline-none focus:ring-2 focus:ring-deep-teal/20 focus:border-deep-teal" />
            </div>
            <div>
              <label className="font-body text-sm text-body-text block mb-1">Max Guests</label>
              <input data-testid="prop-guests-input" type="number" value={form.max_guests} onChange={e => handleChange('max_guests', e.target.value)}
                className="w-full bg-sand-light border border-border-sand rounded-xl px-4 py-2.5 font-body text-sm text-heading focus:outline-none focus:ring-2 focus:ring-deep-teal/20 focus:border-deep-teal" />
            </div>
            <div>
              <label className="font-body text-sm text-body-text block mb-1">Rating</label>
              <input data-testid="prop-rating-input" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => handleChange('rating', e.target.value)}
                className="w-full bg-sand-light border border-border-sand rounded-xl px-4 py-2.5 font-body text-sm text-heading focus:outline-none focus:ring-2 focus:ring-deep-teal/20 focus:border-deep-teal" />
            </div>
          </div>
          <div>
            <label className="font-body text-sm text-body-text block mb-1">Description *</label>
            <textarea data-testid="prop-desc-input" value={form.description} onChange={e => handleChange('description', e.target.value)}
              rows={3} placeholder="Describe the property..."
              className="w-full bg-sand-light border border-border-sand rounded-xl px-4 py-2.5 font-body text-sm text-heading placeholder:text-body-text/40 focus:outline-none focus:ring-2 focus:ring-deep-teal/20 focus:border-deep-teal resize-none" />
          </div>
          <div>
            <label className="font-body text-sm text-body-text block mb-1">Amenities (comma separated)</label>
            <input data-testid="prop-amenities-input" type="text" value={form.amenities} onChange={e => handleChange('amenities', e.target.value)}
              placeholder="WiFi, AC, Kitchen, Parking, TV"
              className="w-full bg-sand-light border border-border-sand rounded-xl px-4 py-2.5 font-body text-sm text-heading placeholder:text-body-text/40 focus:outline-none focus:ring-2 focus:ring-deep-teal/20 focus:border-deep-teal" />
          </div>
          <div>
            <label className="font-body text-sm text-body-text block mb-1">Image URLs (one per line)</label>
            <textarea data-testid="prop-images-input" value={form.images} onChange={e => handleChange('images', e.target.value)}
              rows={3} placeholder="https://images.unsplash.com/..."
              className="w-full bg-sand-light border border-border-sand rounded-xl px-4 py-2.5 font-body text-sm text-heading placeholder:text-body-text/40 focus:outline-none focus:ring-2 focus:ring-deep-teal/20 focus:border-deep-teal resize-none font-mono text-xs" />
          </div>
          {error && (
            <div data-testid="property-form-error" className="flex items-center gap-2 text-red-500 font-body text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="font-body text-sm text-body-text border border-border-sand px-5 py-2.5 rounded-full hover:bg-sand-light transition-all">
              Cancel
            </button>
            <button data-testid="property-form-submit" type="submit" disabled={loading}
              className="font-body text-sm bg-deep-teal text-white px-6 py-2.5 rounded-full hover:bg-teal-hover transition-all disabled:opacity-60 flex items-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={16} /> : null}
              {isEdit ? 'Update Property' : 'Add Property'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// --- Delete Confirm Modal ---
function DeleteConfirmModal({ property, onClose, onConfirm, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-heading text-xl font-medium text-heading mb-2">Delete Property</h3>
        <p className="font-body text-sm text-body-text mb-6">
          Are you sure you want to delete <strong>{property.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="font-body text-sm text-body-text border border-border-sand px-5 py-2.5 rounded-full hover:bg-sand-light transition-all">
            Cancel
          </button>
          <button data-testid="delete-confirm-btn" onClick={onConfirm} disabled={loading}
            className="font-body text-sm bg-red-500 text-white px-6 py-2.5 rounded-full hover:bg-red-600 transition-all disabled:opacity-60 flex items-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Main Admin Dashboard ---
export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('properties');
  const [stats, setStats] = useState({ properties: 0, bookings: 0, contacts: 0, revenue: 0 });
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProperty, setEditProperty] = useState(null);
  const [deleteProperty, setDeleteProperty] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const [statsRes, propsRes, bookingsRes, contactsRes] = await Promise.all([
        axios.get(`${API}/api/admin/stats`, { headers }),
        axios.get(`${API}/api/properties`),
        axios.get(`${API}/api/admin/bookings`, { headers }),
        axios.get(`${API}/api/admin/contacts`, { headers }),
      ]);
      setStats(statsRes.data);
      setProperties(propsRes.data);
      setBookings(bookingsRes.data);
      setContacts(contactsRes.data);
    } catch (err) {
      if (err.response?.status === 401) onLogout();
    }
  }, [onLogout]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePropertySave = () => {
    setShowForm(false);
    setEditProperty(null);
    fetchData();
    showToast(editProperty ? 'Property updated successfully' : 'Property added successfully');
  };

  const handleDelete = async () => {
    if (!deleteProperty) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`${API}/api/admin/properties/${deleteProperty.property_id}`, { headers: getAuthHeaders() });
      setDeleteProperty(null);
      fetchData();
      showToast('Property deleted');
    } catch (err) {
      showToast('Failed to delete property', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true }).catch(() => {});
    onLogout();
  };

  const tabs = [
    { id: 'properties', label: 'Properties', icon: Home },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
    { id: 'contacts', label: 'Inquiries', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-sand-light">
      {/* Header */}
      <div className="bg-white border-b border-border-sand sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <a href="/" data-testid="admin-back-to-site" className="text-body-text hover:text-deep-teal transition-colors">
              <ChevronLeft size={20} />
            </a>
            <h1 className="font-heading text-xl font-semibold text-deep-teal">Hosting Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-body text-sm text-body-text hidden sm:block">{user.email}</span>
            <button data-testid="admin-logout-btn" onClick={handleLogout}
              className="flex items-center gap-1.5 font-body text-sm text-body-text hover:text-red-500 transition-colors">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <StatsBar stats={stats} />

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-border-sand p-1 mb-6 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              data-testid={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 font-body text-sm px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id ? 'bg-deep-teal text-white' : 'text-body-text hover:bg-sand-light'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl font-medium text-heading">Properties</h2>
              <button data-testid="add-property-btn" onClick={() => { setEditProperty(null); setShowForm(true); }}
                className="flex items-center gap-2 bg-deep-teal text-white font-body text-sm px-5 py-2.5 rounded-full hover:bg-teal-hover transition-all">
                <Plus size={16} /> Add Property
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {properties.map((prop, i) => (
                <motion.div
                  key={prop.property_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  data-testid={`admin-property-${i}`}
                  className="bg-white rounded-xl border border-border-sand overflow-hidden group"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={prop.images?.[0] || 'https://placehold.co/600x400?text=No+Image'} alt={prop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-heading text-lg font-medium text-heading">{prop.name}</h4>
                    <p className="font-body text-xs text-body-text mt-1">{prop.location}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-sand">
                      <span className="font-heading text-lg font-semibold text-heading">₹{prop.price_per_night?.toLocaleString()}<span className="font-body text-xs text-body-text font-normal">/night</span></span>
                      <div className="flex gap-1.5">
                        <button data-testid={`edit-property-${i}`}
                          onClick={() => { setEditProperty(prop); setShowForm(true); }}
                          className="p-2 rounded-lg bg-sand-light text-body-text hover:bg-deep-teal hover:text-white transition-all">
                          <Pencil size={14} />
                        </button>
                        <button data-testid={`delete-property-${i}`}
                          onClick={() => setDeleteProperty(prop)}
                          className="p-2 rounded-lg bg-sand-light text-body-text hover:bg-red-500 hover:text-white transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {properties.length === 0 && (
              <div className="text-center py-16">
                <Home size={40} className="mx-auto text-border-sand mb-4" />
                <p className="font-body text-body-text">No properties yet. Add your first property!</p>
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <h2 className="font-heading text-2xl font-medium text-heading mb-6">Bookings</h2>
            <div className="bg-white rounded-xl border border-border-sand overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-sand bg-sand-light">
                      <th className="text-left font-body text-xs text-body-text uppercase tracking-wider px-4 py-3">Booking ID</th>
                      <th className="text-left font-body text-xs text-body-text uppercase tracking-wider px-4 py-3">Guest</th>
                      <th className="text-left font-body text-xs text-body-text uppercase tracking-wider px-4 py-3">Property</th>
                      <th className="text-left font-body text-xs text-body-text uppercase tracking-wider px-4 py-3">Dates</th>
                      <th className="text-left font-body text-xs text-body-text uppercase tracking-wider px-4 py-3">Amount</th>
                      <th className="text-left font-body text-xs text-body-text uppercase tracking-wider px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b, i) => (
                      <tr key={b.booking_id} data-testid={`booking-row-${i}`} className="border-b border-border-sand last:border-0">
                        <td className="px-4 py-3 font-body text-sm font-medium text-heading">{b.booking_id}</td>
                        <td className="px-4 py-3">
                          <p className="font-body text-sm text-heading">{b.guest_name}</p>
                          <p className="font-body text-xs text-body-text">{b.guest_phone}</p>
                        </td>
                        <td className="px-4 py-3 font-body text-sm text-body-text">{b.property_id}</td>
                        <td className="px-4 py-3 font-body text-xs text-body-text">{b.check_in} - {b.check_out}</td>
                        <td className="px-4 py-3 font-body text-sm font-medium text-heading">₹{b.total_amount?.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block font-body text-xs px-2.5 py-1 rounded-full ${
                            b.payment_status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            b.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {b.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {bookings.length === 0 && (
                <div className="text-center py-12">
                  <CalendarCheck size={36} className="mx-auto text-border-sand mb-3" />
                  <p className="font-body text-sm text-body-text">No bookings yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div>
            <h2 className="font-heading text-2xl font-medium text-heading mb-6">Contact Inquiries</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map((c, i) => (
                <motion.div
                  key={c.contact_id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  data-testid={`contact-card-${i}`}
                  className="bg-white rounded-xl border border-border-sand p-5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-body text-sm font-semibold text-heading">{c.name}</h4>
                      <p className="font-body text-xs text-body-text">{c.phone}</p>
                    </div>
                    <span className="font-body text-xs text-body-text/60">{c.created_at?.split('T')[0]}</span>
                  </div>
                  <p className="font-body text-sm text-body-text leading-relaxed">{c.message}</p>
                </motion.div>
              ))}
            </div>
            {contacts.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-border-sand">
                <MessageSquare size={36} className="mx-auto text-border-sand mb-3" />
                <p className="font-body text-sm text-body-text">No contact inquiries yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <PropertyFormModal
            property={editProperty}
            onClose={() => { setShowForm(false); setEditProperty(null); }}
            onSave={handlePropertySave}
          />
        )}
        {deleteProperty && (
          <DeleteConfirmModal
            property={deleteProperty}
            onClose={() => setDeleteProperty(null)}
            onConfirm={handleDelete}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 font-body text-sm px-5 py-3 rounded-full shadow-lg ${
              toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-deep-teal text-white'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
