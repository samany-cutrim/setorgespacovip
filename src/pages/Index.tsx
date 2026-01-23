import React, { useState } from 'react';
import { CalendarDays, Users, CheckCircle2, Wifi, Car, Flame, Waves, Loader2 } from 'lucide-react';
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
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF385C] to-[#E31C5F]">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900 hidden sm:block">setor g espaço vip</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100 rounded-full px-4">
                Área do Cliente
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100 rounded-full px-4">
                Administração
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full border-gray-300 hover:bg-gray-50"
                onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
              >
                🌐 {lang === 'pt' ? 'PT' : 'EN'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section estilo Airbnb */}
      <section className="relative pt-8 pb-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              setor g espaço vip
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto font-light">
              {lang === 'pt' ? 'Espaço perfeito para suas férias em família ou com amigos' : 'Perfect space for your family or friends holidays'}
            </p>
          </div>
          
          {/* Amenities estilo Airbnb */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {amenities.map(({ name, icon: Icon }) => (
              <div key={name} className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                <Icon className="w-4 h-4" />
                <span>{name}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium">
              <Users className="w-4 h-4" />
              <span>{lang === 'pt' ? 'Até 10 hóspedes' : 'Up to 10 guests'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section estilo Airbnb */}
      <section className="py-12 px-6 lg:px-8 bg-gray-50" id="booking">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3 tracking-tight">
              Faça sua reserva
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Preencha seus dados e aguarde nossa confirmação
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
                  <Button variant="outline">Acessar Área do Cliente</Button>
                  <Button onClick={() => { setBookingSuccess(false); setTrackingCode(null); setDateRange(null); setFormData({ fullName: '', phone: '', email: '', numGuests: 1, notes: '' }); }}>Fazer nova reserva</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div>
              <Card className="border border-gray-200 rounded-3xl shadow-lg overflow-hidden">
                <CardContent className="p-8 md:p-10">
                  {/* Calendar Section */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">Selecione as datas</h3>
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
                    <div className="mb-8 p-6 rounded-2xl bg-gray-50 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-600">Check-in</span>
                        <span className="font-semibold text-gray-900">{dateRange.from.toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                        <span className="text-gray-600">Check-out</span>
                        <span className="font-semibold text-gray-900">{dateRange.to.toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-gray-600 text-sm mb-1">Total</div>
                          <div className="text-gray-500 text-xs">{nights} {nights === 1 ? 'diária' : 'diárias'}</div>
                        </div>
                        <div className="text-3xl font-semibold text-gray-900">
                          R$ {totalPrice.toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Contact Form */}
                  <form onSubmit={e => { e.preventDefault(); setIsSubmitting(true); setTimeout(() => { setBookingSuccess(true); setTrackingCode('ABC123'); setIsSubmitting(false); }, 1500); }} className="space-y-5">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-900 mb-2">
                        Nome completo
                      </label>
                      <Input
                        id="fullName"
                        autoComplete="name"
                        value={formData.fullName}
                        onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Digite seu nome completo"
                        className="h-14 rounded-xl border-gray-300 text-base focus:border-gray-900 focus:ring-gray-900"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                          Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="seu@email.com"
                          className="h-14 rounded-xl border-gray-300 text-base focus:border-gray-900 focus:ring-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                          Telefone
                        </label>
                        <Input
                          id="phone"
                          type="tel"
                          autoComplete="tel"
                          value={formData.phone}
                          onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(00) 00000-0000"
                          className="h-14 rounded-xl border-gray-300 text-base focus:border-gray-900 focus:ring-gray-900"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="numGuests" className="block text-sm font-medium text-gray-900 mb-2">
                        Número de hóspedes
                      </label>
                      <Input
                        id="numGuests"
                        type="number"
                        min={1}
                        max={10}
                        value={formData.numGuests}
                        onChange={e => setFormData(prev => ({ ...prev, numGuests: Number(e.target.value) }))}
                        className="h-14 rounded-xl border-gray-300 text-base focus:border-gray-900 focus:ring-gray-900"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-900 mb-2">
                        Observações <span className="text-gray-500 font-normal">(opcional)</span>
                      </label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Alguma solicitação especial?"
                        className="h-14 rounded-xl border-gray-300 text-base focus:border-gray-900 focus:ring-gray-900"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-14 bg-gradient-to-r from-[#FF385C] to-[#E31C5F] hover:from-[#E31C5F] hover:to-[#D70466] text-white font-semibold text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-200" 
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
            </div>
          )}
        </div>
      </section>

      {/* Footer estilo Airbnb */}
      <footer className="border-t border-gray-200 py-12 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-600 text-sm">
            <p>© {new Date().getFullYear()} setor g espaço vip · {lang === 'pt' ? 'Todos os direitos reservados' : 'All rights reserved'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
