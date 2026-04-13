import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { X, ChevronLeft, ChevronRight, Wifi, Wind, UtensilsCrossed, Car, Tv, Star, MapPin, Users, CheckCircle } from 'lucide-react';

const amenityIcons = {
  WiFi: Wifi, AC: Wind, Kitchen: UtensilsCrossed, Parking: Car, TV: Tv,
};

export default function PropertyDetail({ property, onClose, onBookNow }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!property) return null;

  return (
    <AnimatePresence>
      <motion.div
        data-testid="property-detail-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <div ref={emblaRef} className="overflow-hidden rounded-t-2xl">
              <div className="flex">
                {property.images.map((img, i) => (
                  <div key={i} className="flex-[0_0_100%] min-w-0">
                    <div className="aspect-[16/9]">
                      <img src={img} alt={`${property.name} - ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button data-testid="detail-close" onClick={onClose} className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all">
              <X size={20} className="text-deep-teal" />
            </button>
            <button data-testid="detail-prev" onClick={scrollPrev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all">
              <ChevronLeft size={18} className="text-deep-teal" />
            </button>
            <button data-testid="detail-next" onClick={scrollNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all">
              <ChevronRight size={18} className="text-deep-teal" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {property.images.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === selectedIndex ? 'bg-white w-5' : 'bg-white/50'}`} />
              ))}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-2">
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-heading">{property.name}</h2>
              <div className="flex items-center gap-1 shrink-0 ml-4">
                <Star className="text-warm-sand fill-warm-sand" size={18} />
                <span className="font-body text-sm font-semibold text-heading">{property.rating}</span>
                <span className="font-body text-xs text-body-text">({property.reviews_count} reviews)</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mb-4">
              <MapPin size={14} className="text-warm-sand" />
              <span className="font-body text-sm text-body-text">{property.location}</span>
            </div>
            <p className="font-body text-body-text leading-relaxed mb-6">{property.description}</p>

            <h4 className="font-heading text-lg font-medium text-heading mb-3">Amenities</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {property.amenities.map((amenity) => {
                const Icon = amenityIcons[amenity] || CheckCircle;
                return (
                  <div key={amenity} className="flex items-center gap-2 bg-sand-light p-3 rounded-xl">
                    <Icon size={16} className="text-warm-sand" />
                    <span className="font-body text-sm text-body-text">{amenity}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 mb-6">
              <Users size={16} className="text-body-text" />
              <span className="font-body text-sm text-body-text">Maximum {property.max_guests} guests</span>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-border-sand">
              <div>
                <span className="font-heading text-3xl font-semibold text-heading">&#8377;{property.price_per_night.toLocaleString()}</span>
                <span className="font-body text-sm text-body-text ml-2">per night</span>
              </div>
              <button
                data-testid="detail-book-now"
                onClick={() => { onClose(); onBookNow(property); }}
                className="bg-deep-teal text-white font-body px-8 py-3 rounded-full hover:bg-teal-hover transition-all duration-300 text-sm tracking-wide"
              >
                Book This Property
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
