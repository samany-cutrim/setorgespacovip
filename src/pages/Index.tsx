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
    <div className="min-h-screen bg-gradient-to-br from-[#7c3aed] via-[#1a237e] to-[#ffd700]/30 text-[#1a237e]">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white/40 shadow-md">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-[#ffd700]/30 p-2">
            <CalendarDays className="h-8 w-8 text-[#ffd700]" />
          </div>
          <span className="font-display text-2xl font-bold text-[#1a237e]">setor g espaço vip</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}>
            <span className="text-lg">🌐</span> {lang === 'pt' ? 'PT' : 'EN'}
          </Button>
          <Button variant="ghost">Área do Cliente</Button>
          <Button variant="ghost">Área Administrativa</Button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 text-center">
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="font-display text-5xl font-bold mb-4 text-[#1a237e]">
          setor g espaço vip
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="text-xl text-[#7c3aed] mb-8">
          {lang === 'pt' ? 'Perfeita para suas férias em família ou com amigos' : 'Perfect for your family or friends holidays'}
        </motion.p>
      </section>

      {/* Amenities */}
      <section className="py-8 bg-white/60">
        <div className="container mx-auto flex flex-wrap justify-center gap-6">
          {amenities.map(({ name, icon: Icon }) => (
            <motion.div key={name} whileHover={{ scale: 1.08 }} className="flex items-center gap-2 rounded-lg bg-[#7c3aed]/10 px-4 py-2 text-[#1a237e] shadow-sm border border-[#7c3aed]/20">
              <Icon className="h-5 w-5 text-[#7c3aed]" />
              <span className="font-semibold">{name}</span>
            </motion.div>
          ))}
          <motion.div whileHover={{ scale: 1.08 }} className="flex items-center gap-2 rounded-lg bg-[#ffd700]/10 px-4 py-2 text-[#1a237e] shadow-sm border border-[#ffd700]/30">
            <Users className="h-5 w-5 text-[#ffd700]" />
            <span className="font-semibold">{lang === 'pt' ? 'Até 10 hóspedes' : 'Up to 10 guests'}</span>
          </motion.div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-20" id="booking">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold">Faça sua Reserva</h2>
            <p className="mt-2 text-muted-foreground">Selecione as datas e preencha seus dados para solicitar uma reserva</p>
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
              <Card className="shadow-xl border-2 border-[#7c3aed]/10 bg-white/90">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display text-[#7c3aed]">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Escolha as Datas
                  </CardTitle>
                  <CardDescription>Selecione a data de entrada e saída</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl border-2 border-[#7c3aed]/20 bg-gradient-to-br from-[#7c3aed]/10 to-white p-2 shadow-inner">
                    <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={1} className="pointer-events-auto rounded-lg border-none" />
                  </div>
                  {dateRange?.from && dateRange?.to && (
                    <div className="mt-6 space-y-3 rounded-lg bg-primary/5 p-4 shadow-sm">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Check-in</span>
                        <span className="font-medium">{dateRange.from.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Check-out</span>
                        <span className="font-medium">{dateRange.to.toLocaleDateString()}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{nights} {nights === 1 ? 'diária' : 'diárias'}</span>
                        <span className="text-xl font-bold text-primary">R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}
                  <form onSubmit={e => { e.preventDefault(); setIsSubmitting(true); setTimeout(() => { setBookingSuccess(true); setTrackingCode('ABC123'); setIsSubmitting(false); }, 1500); }} className="space-y-5 mt-8">
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="block font-semibold">Nome completo *</label>
                      <Input id="fullName" autoComplete="name" value={formData.fullName} onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))} placeholder="Seu nome" className="rounded-full border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="block font-semibold">Email *</label>
                      <Input id="email" type="email" autoComplete="email" value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="Seu email" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="block font-semibold">Telefone *</label>
                      <Input id="phone" type="tel" autoComplete="tel" value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="Seu telefone" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="numGuests" className="block font-semibold">Nº de hóspedes</label>
                      <Input id="numGuests" type="number" min={1} max={10} value={formData.numGuests} onChange={e => setFormData(prev => ({ ...prev, numGuests: Number(e.target.value) }))} />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="notes" className="block font-semibold">Observações</label>
                      <Input id="notes" value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Observações" />
                    </div>
                    <Button type="submit" className="w-full rounded-full bg-gradient-to-tr from-[#1a237e] to-[#7c3aed] text-white font-bold shadow-lg hover:from-[#7c3aed] hover:to-[#1a237e] transition-all text-lg py-3 border-2 border-[#ffd700]/40" size="lg" disabled={isSubmitting || !dateRange?.from || !dateRange?.to} as={motion.button} whileHover={{ scale: 1.04 }}>
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
      <footer className="border-t bg-gradient-to-t from-[#1a237e]/10 to-white py-8 mt-12">
        <div className="container text-center text-sm text-[#7c3aed]">
          <p>© {new Date().getFullYear()} setor g espaço vip. {lang === 'pt' ? 'Todos os direitos reservados.' : 'All rights reserved.'}</p>
        </div>
      </footer>

    </div>
  );
}
