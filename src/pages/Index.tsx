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
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] p-2.5 shadow-lg">
              <CalendarDays className="h-6 w-6 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-gray-900">setor g espaço vip</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}>
              🌐 {lang === 'pt' ? 'PT' : 'EN'}
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-[#7c3aed]">Área do Cliente</Button>
            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-[#7c3aed]">Área Administrativa</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#7c3aed] via-[#6d28d9] to-[#5b21b6] py-24">
        <div className="container mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            className="font-display text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
          >
            setor g espaço vip
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }} 
            className="text-xl text-white/90 mb-12 max-w-2xl mx-auto"
          >
            {lang === 'pt' ? 'Perfeita para suas férias em família ou com amigos' : 'Perfect for your family or friends holidays'}
          </motion.p>
          
          {/* Amenities */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 max-w-3xl mx-auto"
          >
            {amenities.map(({ name, icon: Icon }) => (
              <div key={name} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white border border-white/20">
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{name}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#ffd700] to-[#f59e0b] px-5 py-2 rounded-full text-[#1a237e] font-semibold shadow-lg">
              <Users className="h-4 w-4" />
              <span className="text-sm">{lang === 'pt' ? 'Até 10 hóspedes' : 'Up to 10 guests'}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-16 bg-gray-50" id="booking">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="mb-12 text-center">
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-3">Faça sua Reserva</h2>
            <p className="text-lg text-gray-600">Selecione as datas e preencha seus dados para solicitar uma reserva</p>
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Card className="shadow-xl border-0 bg-white overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white pb-6">
                  <CardTitle className="flex items-center gap-2 font-display text-2xl">
                    <CalendarDays className="h-6 w-6" />
                    Escolha as Datas
                  </CardTitle>
                  <CardDescription className="text-white/90">Selecione a data de entrada e saída</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="mb-6">
                    <Calendar 
                      mode="range" 
                      selected={dateRange} 
                      onSelect={setDateRange} 
                      numberOfMonths={1} 
                      className="rounded-lg border border-gray-200 p-4 mx-auto"
                    />
                  </div>
                  
                  {dateRange?.from && dateRange?.to && (
                    <div className="mb-8 rounded-xl bg-gradient-to-br from-[#7c3aed]/5 to-[#5b21b6]/5 border border-[#7c3aed]/20 p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">Check-in</span>
                        <span className="text-base font-semibold text-gray-900">{dateRange.from.toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-600">Check-out</span>
                        <span className="text-base font-semibold text-gray-900">{dateRange.to.toLocaleDateString('pt-BR')}</span>
                      </div>
                      <Separator className="mb-4" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">{nights} {nights === 1 ? 'diária' : 'diárias'}</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] bg-clip-text text-transparent">
                          R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={e => { e.preventDefault(); setIsSubmitting(true); setTimeout(() => { setBookingSuccess(true); setTrackingCode('ABC123'); setIsSubmitting(false); }, 1500); }} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Nome completo *</label>
                        <Input
                          id="fullName"
                          autoComplete="name"
                          value={formData.fullName}
                          onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Seu nome"
                          className="h-11 border-gray-300 focus:border-[#7c3aed] focus:ring-[#7c3aed]/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email *</label>
                        <Input
                          id="email"
                          type="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="seu@email.com"
                          className="h-11 border-gray-300 focus:border-[#7c3aed] focus:ring-[#7c3aed]/20"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-semibold text-gray-700">Telefone *</label>
                        <Input
                          id="phone"
                          type="tel"
                          autoComplete="tel"
                          value={formData.phone}
                          onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(00) 00000-0000"
                          className="h-11 border-gray-300 focus:border-[#7c3aed] focus:ring-[#7c3aed]/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="numGuests" className="text-sm font-semibold text-gray-700">Nº de hóspedes</label>
                        <Input
                          id="numGuests"
                          type="number"
                          min={1}
                          max={10}
                          value={formData.numGuests}
                          onChange={e => setFormData(prev => ({ ...prev, numGuests: Number(e.target.value) }))}
                          className="h-11 border-gray-300 focus:border-[#7c3aed] focus:ring-[#7c3aed]/20"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="notes" className="text-sm font-semibold text-gray-700">Observações</label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Alguma observação especial?"
                        className="h-11 border-gray-300 focus:border-[#7c3aed] focus:ring-[#7c3aed]/20"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] hover:from-[#6d28d9] hover:to-[#4c1d95] text-white font-semibold text-base shadow-lg transition-all duration-200" 
                      disabled={isSubmitting || !dateRange?.from || !dateRange?.to}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {lang === 'pt' ? 'Enviando...' : 'Sending...'}
                        </>
                      ) : (
                        lang === 'pt' ? 'Solicitar Reserva' : 'Request Booking'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-600">
            © {new Date().getFullYear()} setor g espaço vip. {lang === 'pt' ? 'Todos os direitos reservados.' : 'All rights reserved.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
