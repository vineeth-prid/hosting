import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: 'easeOut' },
  }),
};

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/api/contact`, form);
      setSuccess(true);
      setForm({ name: '', phone: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" data-testid="contact-section" className="section-padding bg-sand-light">
      <div className="container-custom">
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="overline-text text-center mb-4">
          Get in Touch
        </motion.p>
        <motion.h2
          data-testid="contact-heading"
          initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}
          className="font-heading text-3xl md:text-4xl lg:text-5xl font-light text-heading text-center tracking-tight"
        >
          Plan Your Perfect <span className="italic text-warm-sand">Kochi Stay</span>
        </motion.h2>
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp} className="font-body text-body-text text-center mt-4 mb-14 max-w-xl mx-auto">
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </motion.p>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp}
          className="max-w-xl mx-auto"
        >
          <form data-testid="contact-form" onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 space-y-5">
            <div>
              <label className="font-body text-sm text-body-text block mb-1.5">Name</label>
              <input
                data-testid="contact-name"
                type="text"
                value={form.name}
                onChange={(e) => { setForm({ ...form, name: e.target.value }); setError(''); }}
                placeholder="Your name"
                className="w-full bg-sand-light border border-border-sand rounded-xl px-4 py-3 font-body text-sm text-heading placeholder:text-body-text/50 focus:outline-none focus:ring-2 focus:ring-deep-teal/20 focus:border-deep-teal transition-all"
              />
            </div>
            <div>
              <label className="font-body text-sm text-body-text block mb-1.5">Phone</label>
              <input
                data-testid="contact-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => { setForm({ ...form, phone: e.target.value }); setError(''); }}
                placeholder="+91 XXXXX XXXXX"
                className="w-full bg-sand-light border border-border-sand rounded-xl px-4 py-3 font-body text-sm text-heading placeholder:text-body-text/50 focus:outline-none focus:ring-2 focus:ring-deep-teal/20 focus:border-deep-teal transition-all"
              />
            </div>
            <div>
              <label className="font-body text-sm text-body-text block mb-1.5">Message</label>
              <textarea
                data-testid="contact-message"
                value={form.message}
                onChange={(e) => { setForm({ ...form, message: e.target.value }); setError(''); }}
                placeholder="Tell us about your plans..."
                rows={4}
                className="w-full bg-sand-light border border-border-sand rounded-xl px-4 py-3 font-body text-sm text-heading placeholder:text-body-text/50 focus:outline-none focus:ring-2 focus:ring-deep-teal/20 focus:border-deep-teal transition-all resize-none"
              />
            </div>

            {error && (
              <div data-testid="contact-error" className="flex items-center gap-2 text-red-500 font-body text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {success && (
              <motion.div
                data-testid="contact-success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-green-600 font-body text-sm bg-green-50 p-3 rounded-xl"
              >
                <CheckCircle2 size={16} /> Message sent! We'll get back to you soon.
              </motion.div>
            )}

            <button
              data-testid="contact-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-deep-teal text-white font-body py-3.5 rounded-full hover:bg-teal-hover transition-all duration-300 tracking-wide text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={16} />}
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          <div className="flex items-center justify-center gap-6 mt-8">
            <a
              data-testid="contact-whatsapp-link"
              href="https://wa.me/918089000123"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-body text-sm text-deep-teal hover:text-warm-sand transition-colors"
            >
              <MessageCircle size={18} /> WhatsApp Us
            </a>
            <a
              data-testid="contact-phone-link"
              href="tel:+918089000123"
              className="flex items-center gap-2 font-body text-sm text-deep-teal hover:text-warm-sand transition-colors"
            >
              <Phone size={18} /> +91 8089 000 123
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
