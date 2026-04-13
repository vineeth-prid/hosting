import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  const scrollTo = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer data-testid="footer" className="bg-deep-teal text-white/80">
      <div className="container-custom py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          <div className="md:col-span-4">
            <h3 className="font-heading text-3xl font-semibold text-white mb-4">Hosting</h3>
            <p className="font-body text-sm leading-relaxed text-white/60 max-w-sm">
              Premium staycation homes in the heart of Kochi. Experience comfort, luxury, and authentic Kerala hospitality.
            </p>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-body text-sm font-semibold text-white tracking-wider uppercase mb-4">Navigate</h4>
            <div className="space-y-2.5">
              {[
                { label: 'About', href: '#about' },
                { label: 'Properties', href: '#properties' },
                { label: 'Booking', href: '#booking' },
                { label: 'Services', href: '#services' },
                { label: 'Contact', href: '#contact' },
              ].map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="block font-body text-sm text-white/50 hover:text-warm-sand transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-body text-sm font-semibold text-white tracking-wider uppercase mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-warm-sand mt-1 shrink-0" />
                <span className="font-body text-sm text-white/50">Behind Infopark Phase 2, Kakkanad, Kochi, Kerala</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-warm-sand shrink-0" />
                <a href="tel:+918089000123" className="font-body text-sm text-white/50 hover:text-warm-sand transition-colors">+91 8089 000 123</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-warm-sand shrink-0" />
                <span className="font-body text-sm text-white/50">hello@hostingkochi.com</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-body text-sm font-semibold text-white tracking-wider uppercase mb-4">Follow Us</h4>
            <div className="flex gap-3">
              <a href="#" data-testid="footer-instagram" className="bg-white/10 p-2.5 rounded-xl hover:bg-warm-sand/20 transition-all">
                <Instagram size={18} className="text-white/70" />
              </a>
              <a href="#" data-testid="footer-facebook" className="bg-white/10 p-2.5 rounded-xl hover:bg-warm-sand/20 transition-all">
                <Facebook size={18} className="text-white/70" />
              </a>
            </div>
            <p className="font-body text-xs text-white/30 mt-6">
              Share your Kochi experience with<br />#HostingKochi
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-white/30">
            &copy; {new Date().getFullYear()} Hosting. All rights reserved.
          </p>
          <p className="font-body text-xs text-white/30">
            Premium Staycation Homes in Kochi, India
          </p>
        </div>
      </div>
    </footer>
  );
}
