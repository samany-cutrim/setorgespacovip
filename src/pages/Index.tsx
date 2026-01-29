import React, { useState, useMemo } from 'react';
import { CalendarDays, Users, CheckCircle2, Wifi, Car, Flame, Waves, Loader2, Search, MapPin, Star, Home, Utensils, Wind, Tv, Coffee } from 'lucide-react';
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
  { name: 'Piscina', icon: Waves, category: 'outdoor' },
  { name: 'Churrasqueira', icon: Flame, category: 'outdoor' },
  { name: 'Wi-Fi', icon: Wifi, category: 'essential' },
  { name: 'Estacionamento', icon: Car, category: 'essential' },
  { name: 'Cozinha completa', icon: Utensils, category: 'indoor' },
  { name: 'Ar condicionado', icon: Wind, category: 'indoor' },
  { name: 'TV a cabo', icon: Tv, category: 'indoor' },
  { name: 'Café da manhã', icon: Coffee, category: 'service' },
];

const propertyImages = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600607687644-c7171b42498b?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2000&auto=format&fit=crop',
];

export default function Index() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [lang, setLang] = useState('pt');
  const [dateRange, setDateRange] = useState(null);
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '', numGuests: 1, notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState(null);
  const { data: pricingRules = [] } = usePricingRules();
  
  const nights = dateRange?.from && dateRange?.to ? Math.max(1, (dateRange.to - dateRange.from) / (1000 * 60 * 60 * 24)) : 0;
  const totalPrice = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    return calculateTotalPrice(dateRange.from, dateRange.to, pricingRules);
  }, [dateRange, pricingRules]);

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Airbnb-style Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-[1760px] mx-auto px-6 lg:px-20">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Waves className="w-8 h-8 text-rose-500" />
              <span className="text-xl font-semibold text-rose-500 hidden sm:block">setor g</span>
            </div>
            
            {/* Search bar - Airbnb style */}
            <div className="hidden md:flex items-center gap-0 border border-gray-300 rounded-full px-6 py-2.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 px-3 border-r border-gray-300">
                <span className="text-sm font-medium text-gray-900">Localização</span>
              </div>
              <div className="flex items-center gap-3 px-3 border-r border-gray-300">
                <span className="text-sm font-medium text-gray-900">Check-in</span>
              </div>
              <div className="flex items-center gap-3 px-3 border-r border-gray-300">
                <span className="text-sm font-medium text-gray-900">Check-out</span>
              </div>
              <div className="flex items-center gap-3 px-3">
                <span className="text-sm text-gray-500">Adicionar hóspedes</span>
              </div>
              <div className="flex items-center justify-center w-8 h-8 bg-rose-500 rounded-full ml-2">
                <Search className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Right side menu */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-700 hover:bg-gray-100 rounded-full px-4 font-medium hidden lg:flex"
                onClick={() => navigate('/cliente')}
              >
                Área do Cliente
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-700 hover:bg-gray-100 rounded-full px-4 font-medium hidden lg:flex"
                onClick={() => navigate('/admin')}
              >
                Administração
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full p-2"
                onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
              >
                🌐
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Image Gallery - Airbnb style */}
      <section className="max-w-[1760px] mx-auto px-6 lg:px-20 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-xl overflow-hidden h-[60vh]">
          {/* Main image */}
          <div className="md:col-span-2 md:row-span-2">
            <img 
              src={propertyImages[0]} 
              alt="Property" 
              className="w-full h-full object-cover hover:brightness-95 transition-all cursor-pointer"
            />
          </div>
          {/* Grid images */}
          {propertyImages.slice(1).map((img, idx) => (
            <div key={idx} className={`hidden md:block ${idx >= 2 ? 'rounded-tr-xl' : ''} ${idx === 3 ? 'rounded-br-xl' : ''}`}>
              <img 
                src={img} 
                alt={`Property ${idx + 2}`} 
                className="w-full h-full object-cover hover:brightness-95 transition-all cursor-pointer"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Main Content - Airbnb Layout */}
      <section className="max-w-[1760px] mx-auto px-6 lg:px-20 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and basic info */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                    Setor G Espaço VIP
                  </h1>
                  <div className="flex items-center gap-4 text-gray-700">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">4.95</span>
                      <span className="text-gray-500">(128 avaliações)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="underline cursor-pointer hover:text-gray-900">Brasil</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-base">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-700" />
                  <span>Até 10 hóspedes</span>
                </div>
                <span className="text-gray-300">·</span>
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-gray-700" />
                  <span>Casa inteira</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Sobre este espaço
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {lang === 'pt' 
                  ? 'Espaço perfeito para suas férias em família ou com amigos. Nossa propriedade oferece conforto e privacidade em um ambiente acolhedor. Com capacidade para até 10 pessoas, é ideal para reunir a família ou grupo de amigos em momentos especiais.' 
                  : 'Perfect space for your family vacation or with friends. Our property offers comfort and privacy in a welcoming environment. With capacity for up to 10 people, it is ideal for gathering family or friends on special occasions.'}
              </p>
            </div>

            {/* Amenities */}
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                O que este lugar oferece
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {amenities.map(({ name, icon: Icon }) => (
                  <div key={name} className="flex items-center gap-4 py-2">
                    <Icon className="w-6 h-6 text-gray-700" />
                    <span className="text-gray-900">{name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-6 h-6 fill-current text-gray-900" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  4.95 · 128 avaliações
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {[
                  { category: 'Limpeza', score: 4.9 },
                  { category: 'Comunicação', score: 5.0 },
                  { category: 'Check-in', score: 4.9 },
                  { category: 'Exatidão', score: 4.8 },
                  { category: 'Localização', score: 4.7 },
                  { category: 'Custo-benefício', score: 4.9 },
                ].map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <span className="text-gray-900">{item.category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gray-900" 
                          style={{ width: `${(item.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{item.score}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sample Reviews */}
              <div className="space-y-6">
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
                  <div key={idx}>
                    <div className="flex items-start gap-4">
                      <img 
                        src={review.avatar} 
                        alt={review.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-900">{review.name}</span>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current text-gray-900" />
                          ))}
                        </div>
                        <p className="text-gray-700 leading-relaxed">{review.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="pb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Onde você estará
              </h2>
              <p className="text-gray-700 mb-4">Brasil</p>
              <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">{bookingSuccess ? (
              <Card className="border border-gray-200 rounded-2xl shadow-lg">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-7 w-7 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Reserva Enviada!</h3>
                  <p className="text-gray-600 mb-4">Sua solicitação foi recebida. Entraremos em contato em breve.</p>
                  {trackingCode && (
                    <div className="mt-4 rounded-lg bg-gray-50 p-4">
                      <p className="text-sm text-gray-600 mb-1">Código de acompanhamento:</p>
                      <p className="font-mono text-xl font-bold text-rose-500">{trackingCode}</p>
                    </div>
                  )}
                  <div className="mt-6 flex flex-col gap-2">
                    <Button onClick={() => navigate('/cliente')} className="w-full bg-rose-500 hover:bg-rose-600">
                      Acessar Área do Cliente
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => { 
                        setBookingSuccess(false); 
                        setTrackingCode(null); 
                        setDateRange(null); 
                        setFormData({ fullName: '', phone: '', email: '', numGuests: 1, notes: '' }); 
                      }}
                      className="w-full"
                    >
                      Fazer nova reserva
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-gray-200 rounded-2xl shadow-xl">
                <CardContent className="p-6">
                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-2xl font-semibold text-gray-900">R$ 500</span>
                      <span className="text-gray-600">/ noite</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">4.95</span>
                      <span className="text-gray-500">(128 avaliações)</span>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="mb-4 border border-gray-300 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-2 divide-x divide-gray-300">
                      <div className="p-3">
                        <div className="text-xs font-semibold text-gray-900 uppercase mb-1">Check-in</div>
                        <div className="text-sm text-gray-600">
                          {dateRange?.from ? dateRange.from.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Adicionar data'}
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="text-xs font-semibold text-gray-900 uppercase mb-1">Check-out</div>
                        <div className="text-sm text-gray-600">
                          {dateRange?.to ? dateRange.to.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Adicionar data'}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 pt-2 border-t border-gray-300">
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

                  {/* Guest Count */}
                  <div className="mb-4 p-3 border border-gray-300 rounded-xl">
                    <div className="text-xs font-semibold text-gray-900 uppercase mb-1">Hóspedes</div>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={formData.numGuests}
                      onChange={e => setFormData(prev => ({ ...prev, numGuests: Number(e.target.value) }))}
                      className="border-0 p-0 h-6 text-sm focus-visible:ring-0"
                    />
                  </div>

                  {/* Reserve Button */}
                  <Button 
                    onClick={() => {
                      if (dateRange?.from && dateRange?.to) {
                        // Show form fields
                        const formSection = document.getElementById('booking-form');
                        if (formSection) formSection.classList.remove('hidden');
                      }
                    }}
                    disabled={!dateRange?.from || !dateRange?.to}
                    className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold rounded-xl mb-4"
                  >
                    Reservar
                  </Button>

                  {/* Contact Form - Hidden initially */}
                  <form 
                    id="booking-form"
                    className="hidden space-y-4 mt-4 pt-4 border-t border-gray-200"
                    onSubmit={e => { 
                      e.preventDefault(); 
                      setIsSubmitting(true); 
                      setTimeout(() => { 
                        setBookingSuccess(true); 
                        setTrackingCode('ABC123'); 
                        setIsSubmitting(false); 
                      }, 1500); 
                    }}
                  >
                    <Input
                      placeholder="Nome completo"
                      value={formData.fullName}
                      onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="h-12 rounded-lg"
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="h-12 rounded-lg"
                      required
                    />
                    <Input
                      type="tel"
                      placeholder="Telefone"
                      value={formData.phone}
                      onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="h-12 rounded-lg"
                      required
                    />
                    <Input
                      placeholder="Observações (opcional)"
                      value={formData.notes}
                      onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="h-12 rounded-lg"
                    />
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold rounded-xl" 
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

                  <p className="text-center text-xs text-gray-500 mt-4">
                    Você não será cobrado agora
                  </p>

                  {/* Price Breakdown */}
                  {dateRange?.from && dateRange?.to && nights > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                      <div className="flex items-center justify-between text-gray-900">
                        <span className="underline">R$ 500 x {nights} {nights === 1 ? 'noite' : 'noites'}</span>
                        <span>R$ {totalPrice.toLocaleString('pt-BR')}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between font-semibold text-gray-900">
                        <span>Total</span>
                        <span>R$ {totalPrice.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}</div>
          </div>
        </div>
      </section>

      {/* Modern Footer - Airbnb style */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-[1760px] mx-auto px-6 lg:px-20 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Suporte</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="hover:underline cursor-pointer">Central de Ajuda</li>
                <li className="hover:underline cursor-pointer">Informações de segurança</li>
                <li className="hover:underline cursor-pointer">Opções de cancelamento</li>
                <li className="hover:underline cursor-pointer">Denunciar um problema</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Comunidade</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="hover:underline cursor-pointer">Blog</li>
                <li className="hover:underline cursor-pointer">Fórum</li>
                <li className="hover:underline cursor-pointer">Políticas</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Hospedagem</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="hover:underline cursor-pointer">Anuncie seu espaço</li>
                <li className="hover:underline cursor-pointer">Hospedar de forma responsável</li>
                <li className="hover:underline cursor-pointer">Centro de recursos</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Sobre</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="hover:underline cursor-pointer">Imprensa</li>
                <li className="hover:underline cursor-pointer">Carreiras</li>
                <li className="hover:underline cursor-pointer">Investidores</li>
              </ul>
            </div>
          </div>
          
          <Separator className="mb-6" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>© {new Date().getFullYear()} setor g espaço vip</span>
              <span>·</span>
              <span className="hover:underline cursor-pointer">Privacidade</span>
              <span>·</span>
              <span className="hover:underline cursor-pointer">Termos</span>
              <span>·</span>
              <span className="hover:underline cursor-pointer">Mapa do site</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="hover:underline flex items-center gap-1">
                🌐 {lang === 'pt' ? 'Português (BR)' : 'English (US)'}
              </button>
              <button className="hover:underline">R$ BRL</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
