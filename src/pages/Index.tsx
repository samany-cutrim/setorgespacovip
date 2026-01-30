import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, CheckCircle2, Wifi, Car, Flame, Waves, Loader2, 
  MapPin, Star, Utensils, Wind, Tv, Coffee, Instagram, Sparkles, Key, ChevronDown, Facebook, Menu, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Calendar } from '../components/ui/calendar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { usePricingRules, calculateTotalPrice } from '../hooks/usePricingRules';

const amenities = [
  { name: 'Piscina', icon: Waves, color: 'from-blue-500 to-cyan-500' },
  { name: 'Churrasqueira', icon: Flame, color: 'from-orange-500 to-red-500' },
  { name: 'Wi-Fi Rápido', icon: Wifi, color: 'from-purple-500 to-pink-500' },
  { name: 'Estacionamento', icon: Car, color: 'from-gray-500 to-slate-500' },
  { name: 'Cozinha Completa', icon: Utensils, color: 'from-yellow-500 to-orange-500' },
  { name: 'Ar Condicionado', icon: Wind, color: 'from-cyan-500 to-blue-500' },
  { name: 'TV 4K a Cabo', icon: Tv, color: 'from-indigo-500 to-purple-500' },
  { name: 'Café da Manhã', icon: Coffee, color: 'from-amber-600 to-orange-500' },
];

const propertyImages = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2000&auto=format&fit=crop',
];

const PROPERTY_RATING = 4.95;
const REVIEW_COUNT = 128;

export default function Index() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '', numGuests: 1, notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const { data: pricingRules = [] } = usePricingRules();

  const nights = dateRange?.from && dateRange?.to 
    ? Math.max(1, (dateRange.to - dateRange.from) / (1000 * 60 * 60 * 24)) 
    : 0;
  const totalPrice = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    return calculateTotalPrice(dateRange.from, dateRange.to, pricingRules);
  }, [dateRange, pricingRules]);

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-600/50 transition-shadow">
                <Waves className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">Setor G</h1>
                <p className="text-xs text-purple-600 font-semibold">Espaço VIP</p>
              </div>
            </div>

            {/* Menu Desktop */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                { label: 'Galeria', id: 'gallery' },
                { label: 'Comodidades', id: 'amenities' },
                { label: 'Reservar', id: 'booking' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/cliente')}
                className="hidden sm:inline-flex text-gray-600 hover:text-purple-600"
              >
                Cliente
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/admin')}
                className="hidden sm:inline-flex bg-purple-600 hover:bg-purple-700 text-white"
              >
                Admin
              </Button>
              <Button
                onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                className="hidden sm:inline-flex bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-shadow"
              >
                Reservar
              </Button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden pb-4 space-y-2 border-t border-gray-100"
            >
              <button
                onClick={() => { document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }}
                className="block w-full text-left px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded-lg"
              >
                Galeria
              </button>
              <button
                onClick={() => { document.getElementById('amenities')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }}
                className="block w-full text-left px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded-lg"
              >
                Comodidades
              </button>
              <button
                onClick={() => navigate('/cliente')}
                className="block w-full text-left px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded-lg"
              >
                Área do Cliente
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="block w-full text-left px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded-lg"
              >
                Painel Admin
              </button>
            </motion.div>
          )}
        </div>
      </header>
      {/* HERO SECTION */}
      <section className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={propertyImages[0]}
            alt="Setor G Espaço VIP"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">Experiência Premium</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Setor G <br />
              <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Espaço VIP
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-8 font-light">
              Seu refúgio de luxo, conforto e privacidade
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 rounded-lg"
                onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <CalendarDays className="mr-2 h-5 w-5" />
                Reservar Agora
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 font-bold px-8 rounded-lg"
                onClick={() => navigate('/cliente')}
              >
                <Key className="mr-2 h-5 w-5" />
                Acesso Rápido
              </Button>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 animate-bounce">
            <ChevronDown className="h-6 w-6 text-white/70" />
          </div>
        </div>
      </section>

      {/* AMENITIES SECTION */}
      <section id="amenities" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Comodidades Exclusivas
            </h2>
            <p className="text-lg text-gray-600">Tudo que você precisa para uma estadia perfeita</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {amenities.map(({ name, icon: Icon, color }, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{name}</h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section id="gallery" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Conheça Nossos Ambientes
            </h2>
            <p className="text-lg text-gray-600">Espaços luxuosos e confortáveis pensados para sua comodidade</p>
          </motion.div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-2xl overflow-hidden">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="md:col-span-2 md:row-span-2 overflow-hidden group cursor-pointer h-96 md:h-auto"
            >
              <img
                src={propertyImages[mainImageIndex]}
                alt="Vista principal"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onClick={() => setMainImageIndex((prev) => (prev + 1) % propertyImages.length)}
              />
            </motion.div>

            {/* Thumbnail Grid */}
            {propertyImages.map((img, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className={`overflow-hidden group cursor-pointer h-48 rounded-xl ${
                  idx === mainImageIndex ? 'ring-2 ring-purple-600' : ''
                }`}
                onClick={() => setMainImageIndex(idx)}
              >
                <img
                  src={img}
                  alt={`Ambiente ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKING SECTION */}
      <section id="booking" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Faça Sua Reserva
            </h2>
            <p className="text-lg text-gray-600">Escolha as datas e confirme seu refúgio de luxo</p>
          </motion.div>

          {!bookingSuccess ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Calendar & Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-lg">
                  <CardContent className="p-8">
                    {/* Calendar */}
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Selecionar Datas</h3>
                      <div className="bg-white rounded-xl overflow-hidden">
                        <Calendar
                          mode="range"
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={1}
                          className="w-full p-4"
                          disabled={(date) => date < new Date()}
                        />
                      </div>
                    </div>

                    {/* Selected Dates Display */}
                    {dateRange?.from && dateRange?.to && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 gap-4 mb-8"
                      >
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-sm text-gray-600 mb-1">Check-in</p>
                          <p className="text-lg font-bold text-gray-900">
                            {dateRange.from.toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                          <p className="text-sm text-gray-600 mb-1">Check-out</p>
                          <p className="text-lg font-bold text-gray-900">
                            {dateRange.to.toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Guest Count */}
                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Número de Hóspedes
                      </label>
                      <select
                        value={formData.numGuests}
                        onChange={(e) => setFormData({ ...formData, numGuests: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? 'hóspede' : 'hóspedes'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Contact Form */}
                    {dateRange?.from && dateRange?.to && (
                      <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onSubmit={(e) => {
                          e.preventDefault();
                          setIsSubmitting(true);
                          setTimeout(() => {
                            setBookingSuccess(true);
                            setTrackingCode(`RES${Date.now()}`);
                            setIsSubmitting(false);
                          }, 1500);
                        }}
                        className="space-y-4"
                      >
                        <Input
                          placeholder="Nome completo"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          required
                          className="h-12 rounded-lg"
                        />
                        <Input
                          placeholder="Email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="h-12 rounded-lg"
                        />
                        <Input
                          placeholder="Telefone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                          className="h-12 rounded-lg"
                        />
                        <textarea
                          placeholder="Observações especiais (opcional)"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                          rows="3"
                        />
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold h-12 rounded-lg"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Processando...
                            </>
                          ) : (
                            'Confirmar Reserva'
                          )}
                        </Button>
                      </motion.form>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg sticky top-24">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-8">Resumo</h3>

                    {dateRange?.from && dateRange?.to ? (
                      <div className="space-y-6">
                        <div>
                          <p className="text-white/80 text-sm mb-2">Período</p>
                          <p className="text-lg font-semibold">{nights} noite{nights > 1 ? 's' : ''}</p>
                        </div>
                        <div>
                          <p className="text-white/80 text-sm mb-2">Hóspedes</p>
                          <p className="text-lg font-semibold">{formData.numGuests} pessoa{formData.numGuests > 1 ? 's' : ''}</p>
                        </div>
                        <div className="border-t border-white/30 pt-6">
                          <p className="text-white/80 text-sm mb-2">Valor Total</p>
                          <p className="text-4xl font-bold">
                            R$ {totalPrice.toLocaleString('pt-BR')}
                          </p>
                          <p className="text-white/80 text-xs mt-2">Impostos e taxas inclusos</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CalendarDays className="h-12 w-12 mx-auto mb-4 text-white/40" />
                        <p className="text-white/80">Selecione as datas</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          ) : (
            /* Success Message */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="shadow-xl bg-green-50 border-green-200">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">Reserva Enviada com Sucesso!</h3>
                  <p className="text-gray-600 mb-8">
                    Sua solicitação foi recebida. Entraremos em contato em breve para confirmar sua reserva.
                  </p>

                  {trackingCode && (
                    <div className="bg-white rounded-lg p-6 mb-8 border border-green-200">
                      <p className="text-sm text-gray-600 mb-2">Código de Rastreamento:</p>
                      <p className="text-2xl font-mono font-bold text-green-600">{trackingCode}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={() => navigate('/cliente')}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold"
                    >
                      Área do Cliente
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBookingSuccess(false);
                        setDateRange(null);
                        setFormData({ fullName: '', phone: '', email: '', numGuests: 1, notes: '' });
                      }}
                      className="flex-1"
                    >
                      Fazer Outra Reserva
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Waves className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Setor G</h3>
                  <p className="text-xs text-gray-400">Espaço VIP</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Seu refúgio de luxo e conforto. Experiências inesquecíveis em um espaço exclusivo.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                <a
                  href="https://www.instagram.com/setorgespaco_vip/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 transition-all"
                  title="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://www.facebook.com/setorgespaco"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all"
                  title="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-bold mb-6">Útil</h4>
              <ul className="space-y-3 text-sm">
                <li><button className="text-gray-400 hover:text-white transition-colors">Fazer Reserva</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Área do Cliente</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Política de Cancelamento</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">FAQ</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><button className="text-gray-400 hover:text-white transition-colors">Privacidade</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Termos de Uso</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Cookies</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors">Contato</button></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>© {new Date().getFullYear()} Setor G Espaço VIP. Todos os direitos reservados.</p>
            <p className="text-gray-400">Desenvolvido com ❤️ para sua comodidade</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
