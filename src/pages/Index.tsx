import React, { useState } from 'react';
import { CalendarDays, Users, CheckCircle2, Wifi, Car, Flame, Waves, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Calendar } from '../components/ui/calendar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { usePropertySettings } from '../hooks/usePropertySettings';

export default function Index() {
  const navigate = useNavigate();
  const { data: property } = usePropertySettings();
  const [lang, setLang] = useState('pt');
  const [dateRange, setDateRange] = useState(null);
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '', numGuests: 1, notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState(null);
  const nights = dateRange?.from && dateRange?.to ? Math.max(1, (dateRange.to - dateRange.from) / (1000 * 60 * 60 * 24)) : 0;
  const totalPrice = nights * 500; // Exemplo
  
  // Get property settings with fallbacks
  const propertyName = property?.name || 'setor g espaço vip';
  const propertyDescription = property?.description || 'Perfeita para suas férias em família ou com amigos';
  const maxGuests = property?.max_guests || 10;
  const propertyAmenities = property?.amenities || ['Piscina', 'Churrasqueira', 'Wi-Fi', 'Estacionamento'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header sofisticado */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-yellow-700">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900 tracking-tight">{propertyName}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-700 hover:bg-gray-100 rounded-full px-4 font-medium"
                onClick={() => navigate('/cliente')}
              >
                Área do Cliente
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-700 hover:bg-gray-100 rounded-full px-4 font-medium"
                onClick={() => navigate('/admin')}
              >
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

      {/* Hero Section com imagem de fundo */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Overlay para melhor legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50 z-10" />
        
        {/* Imagem de fundo */}
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop')" }}
        />
        
        <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight font-['Playfair_Display']">
              {propertyName}
            </h1>
            <p className="text-xl md:text-2xl text-white/95 max-w-2xl mx-auto font-light mb-12">
              {lang === 'pt' ? propertyDescription : 'Perfect for your family or friends holidays'}
            </p>
            
            {/* Amenities sofisticadas */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {propertyAmenities.map((amenity) => {
                // Map amenity name to icon
                const iconMap: Record<string, any> = {
                  'Piscina': Waves,
                  'Churrasqueira': Flame,
                  'Wi-Fi': Wifi,
                  'Estacionamento': Car,
                };
                const Icon = iconMap[amenity] || Wifi;
                
                return (
                  <div key={amenity} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                    <Icon className="w-4 h-4" />
                    <span>{amenity}</span>
                  </div>
                );
              })}
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-600 text-white text-sm font-semibold shadow-lg">
                <Users className="w-4 h-4" />
                <span>{lang === 'pt' ? `Até ${maxGuests} hóspedes` : `Up to ${maxGuests} guests`}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-16 px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50" id="booking">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3 tracking-tight font-['Playfair_Display']">
              Faça sua Reserva
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Selecione as datas e preencha seus dados para solicitar uma reserva
            </p>
          </div>
          {bookingSuccess ? (
            <Card className="mx-auto max-w-md text-center shadow-card">
              <CardContent className="pt-12 pb-8">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <h3 className="font-display text-2xl font-semibold">Reserva Enviada!</h3>
                <p className="mt-2 text-muted-foreground">Sua solicitação foi recebida. Entraremos em contato em breve para confirmar a reserva.</p>
                {trackingCode && (
                  <div className="mt-6 rounded-lg bg-primary/5 p-4">
                    <p className="text-sm text-muted-foreground">Seu código de acompanhamento:</p>
                    <p className="mt-1 font-mono text-2xl font-bold tracking-widest text-primary">{trackingCode}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Guarde este código para acompanhar o status da sua reserva</p>
                  </div>
                )}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button variant="outline" onClick={() => navigate('/cliente')}>Acessar Área do Cliente</Button>
                  <Button onClick={() => { setBookingSuccess(false); setTrackingCode(null); setDateRange(null); setFormData({ fullName: '', phone: '', email: '', numGuests: 1, notes: '' }); }}>Fazer nova reserva</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calendar Card - Left Side */}
              <Card className="border border-gray-200 rounded-3xl shadow-xl overflow-hidden bg-white">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CalendarDays className="w-6 h-6 text-amber-600" />
                      <h3 className="text-2xl font-semibold text-gray-900">Calendário</h3>
                    </div>
                    <p className="text-gray-600">Selecione as datas de check-in e check-out</p>
                  </div>
                  
                  <div className="flex justify-center p-4 rounded-2xl bg-gradient-to-b from-gray-50 to-white">
                    <Calendar 
                      mode="range" 
                      selected={dateRange} 
                      onSelect={setDateRange} 
                      numberOfMonths={1} 
                      className="rounded-2xl"
                      disabled={(date) => date < new Date()}
                    />
                  </div>
                  
                  {/* Price Summary */}
                  {dateRange?.from && dateRange?.to && (
                    <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-700 font-medium">Check-in</span>
                        <span className="font-semibold text-gray-900">{dateRange.from.toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-amber-200/50">
                        <span className="text-gray-700 font-medium">Check-out</span>
                        <span className="font-semibold text-gray-900">{dateRange.to.toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-gray-700 font-medium mb-1">Total</div>
                          <div className="text-gray-500 text-sm">{nights} {nights === 1 ? 'diária' : 'diárias'}</div>
                        </div>
                        <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-700 bg-clip-text text-transparent">
                          R$ {totalPrice.toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Form Card - Right Side */}
              <Card className="border border-gray-200 rounded-3xl shadow-xl overflow-hidden bg-white">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-6 h-6 text-amber-600" />
                      <h3 className="text-2xl font-semibold text-gray-900">Seus Dados</h3>
                    </div>
                    <p className="text-gray-600">Preencha o formulário para solicitar sua reserva</p>
                  </div>
                  
                  {/* Contact Form */}
                  <form onSubmit={e => { e.preventDefault(); setIsSubmitting(true); setTimeout(() => { setBookingSuccess(true); setTrackingCode('ABC123'); setIsSubmitting(false); }, 1500); }} className="space-y-5">
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
                        className="h-12 rounded-xl border-gray-300 text-base focus:border-amber-600 focus:ring-amber-600/20"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                          className="h-12 rounded-xl border-gray-300 text-base focus:border-amber-600 focus:ring-amber-600/20"
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
                          className="h-12 rounded-xl border-gray-300 text-base focus:border-amber-600 focus:ring-amber-600/20"
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
                        max={maxGuests}
                        value={formData.numGuests}
                        onChange={e => setFormData(prev => ({ ...prev, numGuests: Number(e.target.value) }))}
                        className="h-12 rounded-xl border-gray-300 text-base focus:border-amber-600 focus:ring-amber-600/20"
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
                        className="h-12 rounded-xl border-gray-300 text-base focus:border-amber-600 focus:ring-amber-600/20"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-14 bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" 
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
                    
                    <p className="text-center text-sm text-gray-500">
                      Você não será cobrado agora. Aguarde nossa confirmação.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Footer estilo Airbnb */}
      <footer className="border-t border-gray-200 py-12 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-600 text-sm">
            <p>© {new Date().getFullYear()} {propertyName} · {lang === 'pt' ? 'Todos os direitos reservados' : 'All rights reserved'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
