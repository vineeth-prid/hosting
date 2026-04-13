import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, CreditCard, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: 'easeOut' },
  }),
};

export default function BookingSection({ properties, selectedProperty }) {
  const [form, setForm] = useState({
    property_id: selectedProperty?.property_id || '',
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in: '',
    check_out: '',
    guests: 1,
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [error, setError] = useState('');

  const selectedProp = properties.find((p) => p.property_id === form.property_id);

  const calculateTotal = (checkIn, checkOut, propId) => {
    const prop = properties.find((p) => p.property_id === propId);
    if (!checkIn || !checkOut || !prop) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    return nights * prop.price_per_night;
  };

  const handleChange = (field, value) => {
    const next = { ...form, [field]: value };
    setForm(next);
    setError('');
    if (field === 'check_in' || field === 'check_out' || field === 'property_id') {
      const ci = field === 'check_in' ? value : next.check_in;
      const co = field === 'check_out' ? value : next.check_out;
      const pid = field === 'property_id' ? value : next.property_id;
      setTotalAmount(calculateTotal(ci, co, pid));
    }
  };

  React.useEffect(() => {
    if (selectedProperty) {
      handleChange('property_id', selectedProperty.property_id);
    }
    // eslint-disable-next-line
  }, [selectedProperty]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.property_id || !form.guest_name || !form.guest_email || !form.guest_phone || !form.check_in || !form.check_out) {
      setError('Please fill in all fields');
      return;
    }

    if (new Date(form.check_out) <= new Date(form.check_in)) {
      setError('Check-out must be after check-in');
      return;
    }

    const amount = calculateTotal(form.check_in, form.check_out, form.property_id);
    if (amount <= 0) {
      setError('Invalid dates selected');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/bookings`, {
        ...form,
        guests: parseInt(form.guests),
        total_amount: amount,
      });

      if (res.data.test_mode) {
        const confirmRes = await axios.post(`${API}/api/bookings/confirm`, {
          booking_id: res.data.booking_id,
        });
        setBookingResult({
          ...confirmRes.data.booking,
          test_mode: true,
        });
      } else {
        setBookingResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ property_id: '', guest_name: '', guest_email: '', guest_phone: '', check_in: '', check_out: '', guests: 1 });
    setTotalAmount(0);
    setBookingResult(null);
    setError('');
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <section id="booking" data-testid="booking-section" className="section-padding bg-sand-light">
      <div className="container-custom">
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="overline-text text-center mb-4">
          Reservations
        </motion.p>
        <motion.h2
          data-testid="booking-heading"
          initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}
          className="font-heading text-3xl md:text-4xl lg:text-5xl font-light text-heading text-center tracking-tight"
        >
          Book Your <span className="italic text-warm-sand">Stay</span>
        </motion.h2>
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp} className="font-body text-body-text text-center mt-4 mb-14 max-w-xl mx-auto">
          Select your dates and reserve your perfect Kochi staycation
        </motion.p>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp}
          className="max-w-2xl mx-auto"
        >
          <AnimatePresence mode="wait">
            {bookingResult ? (
              <motion.div
                key="success"
                data-testid="booking-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card rounded-2xl p-8 md:p-10 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                >
                  <CheckCircle2 className="mx-auto text-green-500 mb-4" size={64} strokeWidth={1.5} />
                </motion.div>
                <h3 className="font-heading text-2xl md:text-3xl font-medium text-heading mb-2">Booking Confirmed!</h3>
                <p className="font-body text-body-text mb-6">Your reservation has been successfully placed.</p>

                <div className="bg-sand-light rounded-xl p-6 text-left mb-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="font-body text-sm text-body-text">Booking ID</span>
                    <span className="font-body text-sm font-semibold text-heading">{bookingResult.booking_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-sm text-body-text">Guest</span>
                    <span className="font-body text-sm font-medium text-heading">{bookingResult.guest_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-sm text-body-text">Check-in</span>
                    <span className="font-body text-sm font-medium text-heading">{bookingResult.check_in}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-sm text-body-text">Check-out</span>
                    <span className="font-body text-sm font-medium text-heading">{bookingResult.check_out}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-sm text-body-text">Guests</span>
                    <span className="font-body text-sm font-medium text-heading">{bookingResult.guests}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-border-sand">
                    <span className="font-body text-sm font-semibold text-heading">Total</span>
                    <span className="font-heading text-xl font-semibold text-heading">&#8377;{bookingResult.total_amount?.toLocaleString()}</span>
                  </div>
                </div>

                {bookingResult.test_mode && (
                  <p className="font-body text-xs text-warm-sand mb-4">
                    Demo Mode - Payment gateway will be connected soon
                  </p>
                )}

                <button
                  data-testid="booking-new"
                  onClick={resetForm}
                  className="font-body text-sm text-deep-teal border border-deep-teal px-6 py-2.5 rounded-full hover:bg-deep-teal hover:text-white transition-all duration-300"
                >
                  Make Another Booking
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                data-testid="booking-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
                className="glass-card rounded-2xl p-6 md:p-8 space-y-5"
              >
                <div>
                  <label className="font-body text-sm text-body-text block mb-1.5">Select Property</label>
                  <select
                    data-testid="booking-property-select"
                    value={form.property_id}
                    onChange={(e) => handleChange('property_id', e.target.value)}
                    className="w-full bg-sand-light border border-border-sand rounded-xl px-4 py-3 font-body text-sm text-heading focus:outline-none focus:ring-2 focus:ring-deep-teal/20 focus:border-deep-teal transition-all"
                  >
                    <option value="">Choose a property</option>
                    {properties.map((p) => (
                      <option key={p.property_id} value={p.property_id}>
                        {p.name} - &#8377;{p.price_per_night.toLocaleString()}/night
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-sm text-body-text block mb-1.5">Full Name</label>
                    <input
                      data-testid="booking-name"
                      type="text"
                      value={form.guest_name}
                      onChange={(e) => handleChange('guest_name', e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-sand-light border border-border-sand rounded-xl px-4 py-3 font-body text-sm text-heading placeholder:text-body-text/50 focus:outline-none focus:ring-2 focus:ring-deep-teal/20 focus:border-deep-teal transition-all"
                    />
                  </div>
                  <div>
                    <label className="font-body text-sm text-body-text block mb-1.5">Email</label>
                    <input
                      data-testid="booking-email"
                      type="email"
                      value={form.guest_email}
                      onChange={(e) => handleChange('guest_email', e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-sand-light border border-border-sand rounded-xl px-4 py-3 font-body text-sm text-heading placeholder:text-body-text/50 focus:outline-none focus:ring-2 focus:ring-deep-teal/20 focus:border-deep-teal transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-body text-sm text-body-text block mb-1.5">Phone Number</label>
                  <input
                    data-testid="booking-phone"
                    type="tel"
                    value={form.guest_phone}
                    onChange={(e) => handleChange('guest_phone', e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-sand-light border border-border-sand rounded-xl px-4 py-3 font-body text-sm text-heading placeholder:text-body-text/50 focus:outline-none focus:ring-2 focus:ring-deep-teal/20 focus:border-deep-teal transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-body text-sm text-body-text flex items-center gap-1.5 mb-1.5">
                      <Calendar size={14} /> Check-in
                    </label>
                    <input
                      data-testid="booking-checkin"
                      type="date"
                      value={form.check_in}
                      min={today}
                      onChange={(e) => handleChange('check_in', e.target.value)}
                      className="w-full bg-sand-light border border-border-sand rounded-xl px-4 py-3 font-body text-sm text-heading focus:outline-none focus:ring-2 focus:ring-deep-teal/20 focus:border-deep-teal transition-all"
                    />
                  </div>
                  <div>
                    <label className="font-body text-sm text-body-text flex items-center gap-1.5 mb-1.5">
                      <Calendar size={14} /> Check-out
                    </label>
                    <input
                      data-testid="booking-checkout"
                      type="date"
                      value={form.check_out}
                      min={form.check_in || today}
                      onChange={(e) => handleChange('check_out', e.target.value)}
                      className="w-full bg-sand-light border border-border-sand rounded-xl px-4 py-3 font-body text-sm text-heading focus:outline-none focus:ring-2 focus:ring-deep-teal/20 focus:border-deep-teal transition-all"
                    />
                  </div>
                  <div>
                    <label className="font-body text-sm text-body-text flex items-center gap-1.5 mb-1.5">
                      <Users size={14} /> Guests
                    </label>
                    <select
                      data-testid="booking-guests"
                      value={form.guests}
                      onChange={(e) => handleChange('guests', e.target.value)}
                      className="w-full bg-sand-light border border-border-sand rounded-xl px-4 py-3 font-body text-sm text-heading focus:outline-none focus:ring-2 focus:ring-deep-teal/20 focus:border-deep-teal transition-all"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].filter(n => !selectedProp || n <= selectedProp.max_guests).map((n) => (
                        <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {totalAmount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-deep-teal/5 border border-deep-teal/10 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard size={18} className="text-deep-teal" />
                      <span className="font-body text-sm text-body-text">Total Amount</span>
                    </div>
                    <span data-testid="booking-total" className="font-heading text-2xl font-semibold text-heading">
                      &#8377;{totalAmount.toLocaleString()}
                    </span>
                  </motion.div>
                )}

                {error && (
                  <div data-testid="booking-error" className="flex items-center gap-2 text-red-500 font-body text-sm">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button
                  data-testid="booking-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-deep-teal text-white font-body py-3.5 rounded-full hover:bg-teal-hover transition-all duration-300 tracking-wide text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Processing...
                    </>
                  ) : (
                    'Confirm & Pay'
                  )}
                </button>

                <p className="font-body text-xs text-center text-body-text/60">
                  Demo Mode - Razorpay payment gateway will be integrated with live keys
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
