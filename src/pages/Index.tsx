import React, { useState, useMemo } from 'react';
import { CalendarDays, Users, CheckCircle2, Wifi, Car, Flame, Waves, Loader2, Search, MapPin, Star, Home, Utensils, Wind, Tv, Coffee, Instagram, Sparkles, Key, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Calendar } from '../components/ui/calendar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { usePricingRules, calculateTotalPrice } from '../hooks/usePricingRules';
import { useIsMobile } from '../hooks/use-mobile';

const amenities = [
  { name: 'Piscina', icon: Waves },
  { name: 'Churrasqueira', icon: Flame },
  { name: 'Wi-Fi', icon: Wifi },
  { name: 'Estacionamento', icon: Car },
  { name: 'Cozinha completa', icon: Utensils },
  { name: 'Ar condicionado', icon: Wind },
  { name: 'TV a cabo', icon: Tv },
  { name: 'Café da manhã', icon: Coffee },
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
const BASE_PRICE = 500;

export default function Index() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [lang, setLang] = useState('pt');
  const [dateRange, setDateRange] = useState(null);
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '', numGuests: 1, notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const { data: pricingRules = [] } = usePricingRules();
  
  const nights = dateRange?.from && dateRange?.to ? Math.max(1, (dateRange.to - dateRange.from) / (1000 * 60 * 60 * 24)) : 0;
  const totalPrice = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    return calculateTotalPrice(dateRange.from, dateRange.to, pricingRules);
  }, [dateRange, pricingRules]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Luxury Fixed Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo Ampliada e com Gradiente */}
            <div className="group flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] shadow-lg transition-transform duration-300 group-hover:scale-105">
                <Waves className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold tracking-tight text-gray-900">setor g</span>
                <span className="font-display text-lg font-semibold bg-gradient-to-r from-[#7c3aed] to-[#c026d3] bg-clip-text text-transparent">espaço vip</span>
              </div>
            </div>

            {/* Navegação Central para Desktop */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                { label: 'Início', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
                { label: 'Galeria', action: () => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' }) },
                { label: 'Comodidades', action: () => document.getElementById('amenities')?.scrollIntoView({ behavior: 'smooth' }) },
                { label: 'Localização', action: () => document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' }) }
              ].map((item) => (
                <a 
                  key={item.label} 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); item.action(); }}
                  className="text-sm font-semibold text-gray-700 hover:text-[#7c3aed] transition-colors duration-200"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Ações à Direita */}
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:inline-flex text-gray-700 hover:bg-gray-100 hover:text-[#7c3aed] rounded-full px-4 font-medium transition-all"
                onClick={() => navigate('/cliente')}
              >
                Área do Cliente
              </Button>
              <Button 
                className="rounded-full bg-gradient-to-r from-[#7c3aed] to-[#c026d3] px-6 font-semibold text-white shadow-lg hover:shadow-xl hover:from-[#6d28d9] hover:to-[#a855f7] transition-all duration-300"
                onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Reservar Agora
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Vídeo ou Imagem de Fundo Dinâmico */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2070&auto=format&fit=crop"
            alt="Vista luxuosa do Setor G Espaço VIP"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
        </div>

        {/* Conteúdo Central */}
        <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            {/* Tag de Luxo */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span className="text-sm font-medium text-white">Experiência Premium</span>
            </div>

            {/* Título Principal */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight leading-[0.9]">
              <span className="block">setor g</span>
              <span className="block bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 bg-clip-text text-transparent">
                espaço vip
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light mb-10 leading-relaxed">
              O refúgio perfeito para momentos inesquecíveis. Conforto, elegância e privacidade em um único lugar.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                className="rounded-full bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg font-semibold shadow-2xl transition-all hover:scale-105 duration-300"
                onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <CalendarDays className="mr-2 h-5 w-5" />
                Reservar Agora
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="rounded-full border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold backdrop-blur-sm transition-all"
                onClick={() => navigate('/cliente')}
              >
                <Key className="mr-2 h-5 w-5" />
                Área do Cliente
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Indicador de Scroll */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="animate-bounce">
            <ChevronDown className="h-6 w-6 text-white/70" />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="amenities" className="py-20 bg-background">
        <div className="max-w-[1760px] mx-auto px-6 lg:px-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
              Por que escolher o Setor G?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Desfrute de comodidades exclusivas e serviços premium
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {amenities.map(({ name, icon: Icon }) => (
              <motion.div
                key={name}
                whileHover={{ y: -5 }}
                className="group relative"
              >
                <Card className="h-full border-primary/10 shadow-card hover:shadow-luxury transition-all duration-300">
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-luxury flex items-center justify-center">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute inset-0 blur-xl bg-primary/30 rounded-full -z-10 group-hover:bg-accent/30 transition-colors"></div>
                    </div>
                    <h3 className="font-semibold text-lg">{name}</h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-muted/30">
        <div className="max-w-[1760px] mx-auto px-6 lg:px-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
              Galeria
            </h2>
            <p className="text-lg text-muted-foreground">
              Conheça nossos espaços
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-2xl overflow-hidden">
            {/* Main image */}
            <div className="md:col-span-2 md:row-span-2 overflow-hidden group">
              <img 
                src={propertyImages[0]} 
                alt="Vista principal da propriedade com piscina" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
              />
            </div>
            {/* Grid images */}
            {propertyImages.slice(1).map((img, idx) => (
              <div key={idx} className="hidden md:block overflow-hidden group h-64">
                <img 
                  src={img} 
                  alt={`Vista ${idx + 2} da propriedade`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews & Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="max-w-[1760px] mx-auto px-6 lg:px-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <Star className="w-6 h-6 fill-accent text-accent" />
              <h2 className="text-4xl md:text-5xl font-bold text-gradient">
                {PROPERTY_RATING} · {REVIEW_COUNT} Avaliações
              </h2>
            </div>
            <p className="text-lg text-muted-foreground">
              O que nossos hóspedes dizem
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { category: 'Limpeza', score: 4.9 },
              { category: 'Comunicação', score: 5.0 },
              { category: 'Check-in', score: 4.9 },
              { category: 'Exatidão', score: 4.8 },
              { category: 'Localização', score: 4.7 },
              { category: 'Custo-benefício', score: 4.9 },
            ].map((item) => (
              <Card key={item.category} className="border-primary/10 shadow-card hover:shadow-luxury transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">{item.category}</span>
                    <span className="text-sm font-bold text-primary">{item.score}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full gradient-luxury" 
                      style={{ width: `${(item.score / 5) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sample Reviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {[
              {
                name: 'Ana Paula',
                date: 'Dezembro 2025',
                rating: 5,
                text: 'Lugar maravilhoso! Perfeito para relaxar com a família. A piscina é incrível e a churrasqueira foi muito utilizada. Voltaremos com certeza!',
                avatar: 'https://i.pravatar.cc/150?img=1'
              },
              {
                name: 'Carlos Eduardo',
                date: 'Novembro 2025',
                rating: 5,
                text: 'Espaço excelente, muito bem localizado e com todas as comodidades necessárias. Anfitriões muito atenciosos!',
                avatar: 'https://i.pravatar.cc/150?img=12'
              }
            ].map((review, idx) => (
              <Card key={idx} className="border-primary/10 shadow-card hover:shadow-luxury transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <img 
                      src={review.avatar} 
                      alt={review.name}
                      className="w-12 h-12 rounded-full ring-2 ring-primary/20"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{review.name}</span>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                        ))}
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{review.text}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Google Reviews Link */}
          <div className="text-center">
            <Button 
              variant="gradient" 
              size="lg"
              className="rounded-full px-8"
              onClick={() => window.open('https://share.google/O3VdkyYN50Ze8wIyB', '_blank')}
            >
              Ver todas as avaliações no Google
            </Button>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-20">
          {/* Cabeçalho da Seção de Reserva */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-[#7c3aed]/10 to-[#c026d3]/10 border border-[#7c3aed]/20">
              <CalendarDays className="h-4 w-4 text-[#7c3aed]" />
              <span className="text-sm font-semibold text-[#7c3aed]">Reserva Rápida</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
              Sua <span className="bg-gradient-to-r from-[#7c3aed] to-[#c026d3] bg-clip-text text-transparent">Experiência</span> Começa Aqui
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Em poucos passos, garanta seu refúgio de luxo. Simples, rápido e seguro.
            </p>
          </div>

          {/* Indicador de Passos */}
          <div className="flex justify-center mb-10">
            <div className="flex items-center">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${step === 1 ? 'border-[#7c3aed] bg-[#7c3aed] text-white' : 'border-gray-300'}`}>
                    {step}
                  </div>
                  {step < 3 && <div className="h-0.5 w-16 bg-gray-300 mx-2"></div>}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Card do Calendário (Ocupa 2 colunas) */}
            <div className="lg:col-span-2">
              {bookingSuccess ? (
                <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
                  <CardContent className="pt-8 pb-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-luxury">
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gradient mb-2">Reserva Enviada!</h3>
                    <p className="text-muted-foreground mb-4">Sua solicitação foi recebida. Entraremos em contato em breve.</p>
                    {trackingCode && (
                      <div className="mt-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-6 border border-primary/20">
                        <p className="text-sm text-muted-foreground mb-2">Código de acompanhamento:</p>
                        <p className="font-mono text-2xl font-bold text-gradient">{trackingCode}</p>
                      </div>
                    )}
                    <div className="mt-6 flex flex-col gap-3">
                      <Button 
                        variant="gradient"
                        size="lg"
                        onClick={() => navigate('/cliente')} 
                        className="w-full rounded-full"
                      >
                        Acessar Área do Cliente
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => { 
                          setBookingSuccess(false); 
                          setTrackingCode(null); 
                          setDateRange(null); 
                          setFormData({ fullName: '', phone: '', email: '', numGuests: 1, notes: '' }); 
                        }}
                        className="w-full rounded-full"
                      >
                        Fazer nova reserva
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
                  <CardContent className="p-8">
                    {/* Date Selection */}
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold mb-4">Selecione as Datas</h3>
                      <div className="border border-primary/20 rounded-2xl overflow-hidden">
                        <div className="grid grid-cols-2 divide-x divide-primary/20">
                          <div className="p-4">
                            <div className="text-xs font-semibold text-primary uppercase mb-1">Check-in</div>
                            <div className="text-sm text-muted-foreground">
                              {dateRange?.from ? dateRange.from.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Adicionar data'}
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="text-xs font-semibold text-primary uppercase mb-1">Check-out</div>
                            <div className="text-sm text-muted-foreground">
                              {dateRange?.to ? dateRange.to.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Adicionar data'}
                            </div>
                          </div>
                        </div>
                        <div className="p-4 pt-2 border-t border-primary/20">
                          <Calendar 
                            mode="range" 
                            selected={dateRange} 
                            onSelect={setDateRange} 
                            numberOfMonths={1} 
                            className="w-full"
                            disabled={(date) => date < new Date()}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Guest Count */}
                    <div className="mb-4 p-4 border border-primary/20 rounded-2xl">
                      <div className="text-xs font-semibold text-primary uppercase mb-1">Hóspedes</div>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={formData.numGuests}
                        onChange={e => setFormData(prev => ({ ...prev, numGuests: Number(e.target.value) }))}
                        className="border-0 p-0 h-6 text-sm focus-visible:ring-0"
                      />
                    </div>

                    {/* Contact Form */}
                    {showBookingForm && (
                      <form 
                        className="space-y-4 mt-4 pt-4 border-t border-border"
                        onSubmit={e => { 
                          e.preventDefault(); 
                          setIsSubmitting(true); 
                          setTimeout(() => { 
                            setBookingSuccess(true); 
                            setTrackingCode(`RES${Date.now()}`); 
                            setIsSubmitting(false); 
                          }, 1500); 
                        }}
                      >
                        <Input
                          placeholder="Nome completo"
                          value={formData.fullName}
                          onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                          className="h-12 rounded-xl border-primary/20"
                          required
                        />
                        <Input
                          type="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="h-12 rounded-xl border-primary/20"
                          required
                        />
                        <Input
                          type="tel"
                          placeholder="Telefone"
                          value={formData.phone}
                          onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="h-12 rounded-xl border-primary/20"
                          required
                        />
                        <Input
                          placeholder="Observações (opcional)"
                          value={formData.notes}
                          onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          className="h-12 rounded-xl border-primary/20"
                        />
                        <Button 
                          type="submit" 
                          variant="gradient"
                          size="lg"
                          className="w-full rounded-full" 
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            'Confirmar Reserva'
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Card de Resumo Lateral */}
            <Card className="border-0 shadow-2xl rounded-3xl bg-gradient-to-b from-[#7c3aed] to-[#5b21b6] text-white overflow-hidden">
              <CardContent className="p-8 h-full flex flex-col">
                <h3 className="text-2xl font-bold mb-6">Resumo da Reserva</h3>
                <div className="space-y-6 flex-grow">
                  {dateRange?.from && dateRange?.to ? (
                    <>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-white/20">
                          <span className="text-white/80">Check-in</span>
                          <span className="font-bold text-lg">{dateRange.from.toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-white/20">
                          <span className="text-white/80">Check-out</span>
                          <span className="font-bold text-lg">{dateRange.to.toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">Diárias</span>
                          <span className="font-bold text-xl">{nights}</span>
                        </div>
                      </div>
                      <div className="pt-6 border-t border-white/20">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white/80">Valor total</span>
                          <span className="text-3xl font-bold">R$ {totalPrice.toLocaleString('pt-BR')}</span>
                        </div>
                        <p className="text-sm text-white/60">Impostos e taxas inclusos</p>
                      </div>
                      {!showBookingForm && (
                        <Button 
                          onClick={() => {
                            if (dateRange?.from && dateRange?.to) {
                              setShowBookingForm(true);
                            }
                          }}
                          disabled={!dateRange?.from || !dateRange?.to}
                          className="w-full rounded-full bg-white text-[#7c3aed] hover:bg-gray-100 font-semibold transition-all mt-4"
                          size="lg"
                        >
                          Continuar Reserva
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <CalendarDays className="h-12 w-12 mx-auto mb-4 text-white/40" />
                        <p className="text-white/80">Selecione as datas para ver o resumo</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Luxury Footer */}
      <footer id="location" className="relative bg-gradient-to-br from-primary/5 to-accent/5 border-t border-primary/10">
        <div className="max-w-[1760px] mx-auto px-6 lg:px-20 py-16">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <Waves className="w-10 h-10 text-primary" />
                  <div className="absolute inset-0 blur-lg bg-primary/20 rounded-full -z-10"></div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gradient">Setor G Espaço VIP</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Luxo & Exclusividade</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Seu refúgio de luxo e conforto. Experiências inesquecíveis em um espaço exclusivo.
              </p>
              <div className="flex items-center gap-3">
                <a 
                  href="https://www.instagram.com/setorgespaco_vip/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-luxury hover:scale-110 transition-transform"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
            
            {/* Links Columns */}
            <div>
              <h4 className="font-bold text-foreground mb-4">Reservas</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">Fazer Reserva</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Área do Cliente</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Política de Cancelamento</li>
                <li className="hover:text-primary transition-colors cursor-pointer">FAQ</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-4">Sobre</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">Nossa História</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Galeria</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Depoimentos</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Contato</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">Privacidade</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Termos de Uso</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Cookies</li>
              </ul>
            </div>
          </div>
          
          <Separator className="mb-8" />
          
          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} Setor G Espaço VIP</span>
              <span>·</span>
              <span>Todos os direitos reservados</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
              >
                🌐 {lang === 'pt' ? 'Português (BR)' : 'English (US)'}
              </button>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">R$ BRL</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
