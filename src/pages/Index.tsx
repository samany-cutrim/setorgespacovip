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
    <div className="min-h-screen bg-gradient-to-br from-[#7c3aed] via-[#5b21b6] to-[#1a237e]">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-gradient-to-br from-[#7c3aed] to-[#ffd700] p-2">
            <CalendarDays className="h-8 w-8 text-white" />
          </div>
          <span className="font-display text-2xl font-bold text-[#1a237e]">setor g espaço vip</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="flex items-center gap-2 border-[#7c3aed] text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white" onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}>
            <span className="text-lg">🌐</span> {lang === 'pt' ? 'PT' : 'EN'}
          </Button>
          <Button variant="ghost" className="text-[#1a237e] hover:bg-[#7c3aed]/10">Área do Cliente</Button>
          <Button variant="ghost" className="text-[#1a237e] hover:bg-[#7c3aed]/10">Área Administrativa</Button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 text-center">
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="font-display text-5xl font-bold mb-4 text-white drop-shadow-lg">
          setor g espaço vip
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="text-xl text-white/90 mb-8 drop-shadow-md">
          {lang === 'pt' ? 'Perfeita para suas férias em família ou com amigos' : 'Perfect for your family or friends holidays'}
        </motion.p>
        
        {/* Amenities inline */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8 px-4">
          {amenities.map(({ name, icon: Icon }) => (
            <div key={name} className="flex items-center gap-2 text-white">
              <Icon className="h-5 w-5" />
              <span className="font-medium">{name}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 bg-[#ffd700] text-[#1a237e] px-4 py-2 rounded-md font-semibold">
            <Users className="h-5 w-5" />
            <span>{lang === 'pt' ? 'Até 10 hóspedes' : 'Up to 10 guests'}</span>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-12" id="booking">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-bold text-[#1a237e] drop-shadow-sm">Faça sua Reserva</h2>
            <p className="mt-2 text-[#1a237e]/80 text-base">Selecione as datas e preencha seus dados para solicitar uma reserva</p>
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
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader className="bg-[#7c3aed] text-white">
                  <CardTitle className="flex items-center gap-2 font-display text-xl">
                    <CalendarDays className="h-5 w-5" />
                    Escolha as Datas
                  </CardTitle>
                  <CardDescription className="text-white/90 text-sm">Selecione a data de entrada e saída</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 pb-8">
                  <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={1} className="pointer-events-auto rounded-lg border-none mx-auto" />
                  {dateRange?.from && dateRange?.to && (
                    <div className="mt-6 space-y-3 rounded-lg bg-[#7c3aed]/5 p-4 border border-[#7c3aed]/20">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Check-in</span>
                        <span className="font-semibold text-[#1a237e]">{dateRange.from.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Check-out</span>
                        <span className="font-semibold text-[#1a237e]">{dateRange.to.toLocaleDateString()}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">{nights} {nights === 1 ? 'diária' : 'diárias'}</span>
                        <span className="text-xl font-bold text-[#7c3aed]">R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}
                  <form onSubmit={e => { e.preventDefault(); setIsSubmitting(true); setTimeout(() => { setBookingSuccess(true); setTrackingCode('ABC123'); setIsSubmitting(false); }, 1500); }} className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="block text-sm font-semibold text-[#1a237e]">Nome completo *</label>
                      <Input id="fullName" autoComplete="name" value={formData.fullName} onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))} placeholder="Seu nome" className="border-[#7c3aed]/30 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-semibold text-[#1a237e]">Email *</label>
                      <Input id="email" type="email" autoComplete="email" value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="Seu email" className="border-[#7c3aed]/30 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-semibold text-[#1a237e]">Telefone *</label>
                      <Input id="phone" type="tel" autoComplete="tel" value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="Seu telefone" className="border-[#7c3aed]/30 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="numGuests" className="block text-sm font-semibold text-[#1a237e]">Nº de hóspedes</label>
                      <Input id="numGuests" type="number" min={1} max={10} value={formData.numGuests} onChange={e => setFormData(prev => ({ ...prev, numGuests: Number(e.target.value) }))} className="border-[#7c3aed]/30 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="notes" className="block text-sm font-semibold text-[#1a237e]">Observações</label>
                      <Input id="notes" value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Observações" className="border-[#7c3aed]/30 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30" />
                    </div>
                    <Button type="submit" className="w-full bg-[#7c3aed] hover:bg-[#5b21b6] text-white font-semibold shadow-md text-base py-5" size="lg" disabled={isSubmitting || !dateRange?.from || !dateRange?.to}>
                      {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{lang === 'pt' ? 'Enviando...' : 'Sending...'}</>) : (lang === 'pt' ? 'Solicitar Reserva' : 'Request Booking')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-[#1a237e]/90 backdrop-blur-sm py-8 mt-12">
        <div className="container text-center text-sm text-white/90">
          <p>© {new Date().getFullYear()} setor g espaço vip. {lang === 'pt' ? 'Todos os direitos reservados.' : 'All rights reserved.'}</p>
        </div>
      </footer>

    </div>
  );
}
