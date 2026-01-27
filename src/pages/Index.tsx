import React, { useState } from 'react';
import { CalendarDays, Users, CheckCircle2, Wifi, Car, Flame, Waves, Loader2, MapPin, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Calendar } from '../components/ui/calendar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';

const amenities = [
  { name: 'Piscina', icon: Waves },
  { name: 'Churrasqueira', icon: Flame },
  { name: 'Wi-Fi', icon: Wifi },
  { name: 'Estacionamento', icon: Car },
];

export default function Index() {
  const [lang, setLang] = useState('pt');
  const [dateRange, setDateRange] = useState(null);
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '', numGuests: 1, notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState(null);
  const nights = dateRange?.from && dateRange?.to ? Math.max(1, (dateRange.to - dateRange.from) / (1000 * 60 * 60 * 24)) : 0;
  const totalPrice = nights * 500; // Exemplo

  return (
    <div className="min-h-screen bg-white">
      {/* Header estilo Airbnb */}
      <header className="sticky top-0 z-50 bg-white/95 border-b border-gray-200 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF385C] to-[#E31C5F] shadow-md">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">setor g espaço vip</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100 rounded-full px-4 font-medium">
                Área do Cliente
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100 rounded-full px-4 font-medium">
                Administração
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full border-gray-300 hover:bg-gray-50 font-medium"
                onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
              >
                🌐 {lang === 'pt' ? 'PT' : 'EN'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section estilo Airbnb Modernizado */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF385C]/10 to-[#E31C5F]/10 border border-[#FF385C]/20 mb-6">
              <Sparkles className="w-4 h-4 text-[#FF385C]" />
              <span className="text-sm font-semibold text-[#FF385C]">Espaço Premium VIP</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
              setor g espaço vip
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
              {lang === 'pt' ? 'Espaço perfeito para suas férias em família ou com amigos. Conforto, lazer e privacidade.' : 'Perfect space for your family or friends holidays. Comfort, leisure and privacy.'}
            </p>
            
            {/* Rating Badge */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <div className="flex items-center gap-1 px-4 py-2 rounded-full bg-gray-900 text-white">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">4.9</span>
                <span className="text-gray-300 mx-1">·</span>
                <span className="text-sm">50+ avaliações</span>
              </div>
            </div>
          </motion.div>
          
          {/* Amenities estilo Airbnb */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-12"
          >
            {amenities.map(({ name, icon: Icon }) => (
              <div key={name} className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-gray-700 text-sm font-medium">
                <Icon className="w-4 h-4 text-primary" />
                <span>{name}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-gray-900 to-gray-800 text-white text-sm font-medium shadow-md">
              <Users className="w-4 h-4" />
              <span>{lang === 'pt' ? 'Até 10 hóspedes' : 'Up to 10 guests'}</span>
            </div>
          </motion.div>

          {/* Image Gallery Placeholder */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-6xl mx-auto"
          >
            <div className="md:col-span-2 h-96 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-3xl flex items-center justify-center overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 group-hover:opacity-80 transition-opacity" />
              <div className="relative text-center">
                <Waves className="w-16 h-16 text-primary mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium text-gray-600">Vista Principal</p>
              </div>
            </div>
            <div className="h-64 bg-gradient-to-br from-accent/20 to-primary/20 rounded-3xl flex items-center justify-center overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10 group-hover:opacity-80 transition-opacity" />
              <div className="relative text-center">
                <Flame className="w-12 h-12 text-accent mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium text-gray-600">Área de Lazer</p>
              </div>
            </div>
            <div className="h-64 bg-gradient-to-br from-secondary/30 to-accent/20 rounded-3xl flex items-center justify-center overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-accent/10 group-hover:opacity-80 transition-opacity" />
              <div className="relative text-center">
                <MapPin className="w-12 h-12 text-warning mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium text-gray-600">Espaços Internos</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Booking Section estilo Airbnb */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50" id="booking">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Faça sua reserva
            </h2>
            <p className="text-lg md:text-xl text-gray-600 font-light">
              Preencha seus dados e aguarde nossa confirmação
            </p>
          </motion.div>
          
          {bookingSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="mx-auto max-w-md text-center shadow-2xl border-0 rounded-3xl overflow-hidden">
                <CardContent className="pt-12 pb-10 px-8">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-success/20 to-success/10">
                    <CheckCircle2 className="h-10 w-10 text-success" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">Reserva Enviada!</h3>
                  <p className="text-base text-gray-600 leading-relaxed">Sua solicitação foi recebida. Entraremos em contato em breve para confirmar a reserva.</p>
                  {trackingCode && (
                    <div className="mt-8 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 p-6 border border-primary/10">
                      <p className="text-sm font-medium text-gray-600 mb-2">Seu código de acompanhamento:</p>
                      <p className="font-mono text-3xl font-bold tracking-widest text-primary mb-3">{trackingCode}</p>
                      <p className="text-xs text-gray-500">Guarde este código para acompanhar o status da sua reserva</p>
                    </div>
                  )}
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button variant="outline" className="rounded-xl h-12 px-6 font-medium border-gray-300">Acessar Área do Cliente</Button>
                    <Button 
                      onClick={() => { setBookingSuccess(false); setTrackingCode(null); setDateRange(null); setFormData({ fullName: '', phone: '', email: '', numGuests: 1, notes: '' }); }}
                      className="rounded-xl h-12 px-6 bg-gradient-to-r from-[#FF385C] to-[#E31C5F] hover:from-[#E31C5F] hover:to-[#D70466] font-medium"
                    >
                      Fazer nova reserva
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-0 rounded-3xl shadow-2xl overflow-hidden">
                <CardContent className="p-8 md:p-12">
                  {/* Calendar Section */}
                  <div className="mb-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Selecione as datas</h3>
                    <div className="flex justify-center">
                      <Calendar 
                        mode="range" 
                        selected={dateRange} 
                        onSelect={setDateRange} 
                        numberOfMonths={1} 
                        className="rounded-2xl border-0 p-0"
                      />
                    </div>
                  </div>
                  
                  {/* Price Summary */}
                  {dateRange?.from && dateRange?.to && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="mb-10 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-600 font-medium">Check-in</span>
                        <span className="font-semibold text-gray-900">{dateRange.from.toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-300">
                        <span className="text-gray-600 font-medium">Check-out</span>
                        <span className="font-semibold text-gray-900">{dateRange.to.toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-gray-600 font-medium mb-1">Total</div>
                          <div className="text-gray-500 text-sm">{nights} {nights === 1 ? 'diária' : 'diárias'}</div>
                        </div>
                        <div className="text-4xl font-bold text-gray-900">
                          R$ {totalPrice.toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Contact Form */}
                  <form onSubmit={e => { e.preventDefault(); setIsSubmitting(true); setTimeout(() => { setBookingSuccess(true); setTrackingCode('ABC123'); setIsSubmitting(false); }, 1500); }} className="space-y-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900 mb-2">
                        Nome completo
                      </label>
                      <Input
                        id="fullName"
                        autoComplete="name"
                        value={formData.fullName}
                        onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Digite seu nome completo"
                        className="h-14 rounded-xl border-gray-300 text-base focus:border-primary focus:ring-primary shadow-sm"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                          Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="seu@email.com"
                          className="h-14 rounded-xl border-gray-300 text-base focus:border-primary focus:ring-primary shadow-sm"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                          Telefone
                        </label>
                        <Input
                          id="phone"
                          type="tel"
                          autoComplete="tel"
                          value={formData.phone}
                          onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(00) 00000-0000"
                          className="h-14 rounded-xl border-gray-300 text-base focus:border-primary focus:ring-primary shadow-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="numGuests" className="block text-sm font-semibold text-gray-900 mb-2">
                        Número de hóspedes
                      </label>
                      <Input
                        id="numGuests"
                        type="number"
                        min={1}
                        max={10}
                        value={formData.numGuests}
                        onChange={e => setFormData(prev => ({ ...prev, numGuests: Number(e.target.value) }))}
                        className="h-14 rounded-xl border-gray-300 text-base focus:border-primary focus:ring-primary shadow-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="notes" className="block text-sm font-semibold text-gray-900 mb-2">
                        Observações <span className="text-gray-500 font-normal">(opcional)</span>
                      </label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Alguma solicitação especial?"
                        className="h-14 rounded-xl border-gray-300 text-base focus:border-primary focus:ring-primary shadow-sm"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-14 bg-gradient-to-r from-[#FF385C] to-[#E31C5F] hover:from-[#E31C5F] hover:to-[#D70466] text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" 
                      disabled={isSubmitting || !dateRange?.from || !dateRange?.to}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        'Solicitar Reserva'
                      )}
                    </Button>
                    
                    <p className="text-center text-sm text-gray-500 mt-4">
                      Você não será cobrado ainda
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer estilo Airbnb */}
      <footer className="border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-600 text-sm">
            <p className="font-medium">© {new Date().getFullYear()} setor g espaço vip · {lang === 'pt' ? 'Todos os direitos reservados' : 'All rights reserved'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
