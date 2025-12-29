import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add Brazil country code if not present
  if (cleaned.length === 11 || cleaned.length === 10) {
    return `55${cleaned}`;
  }
  
  return cleaned;
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

interface ReservationDetails {
  guestName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  propertyName?: string;
  trackingCode?: string;
}

function getClientAreaLink(trackingCode?: string): string {
  const baseUrl = window.location.origin;
  return trackingCode 
    ? `${baseUrl}/cliente?codigo=${trackingCode}`
    : `${baseUrl}/cliente`;
}

export function generateConfirmationMessage(details: ReservationDetails): string {
  const checkInFormatted = format(parseISO(details.checkIn), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const checkOutFormatted = format(parseISO(details.checkOut), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const totalFormatted = details.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const clientLink = getClientAreaLink(details.trackingCode);

  return `Olá ${details.guestName}! 👋

Sua reserva em *${details.propertyName || 'setor g espaço vip'}* foi *CONFIRMADA*! ✅

📅 *Check-in:* ${checkInFormatted}
📅 *Check-out:* ${checkOutFormatted}
💰 *Valor total:* R$ ${totalFormatted}
${details.trackingCode ? `\n🔑 *Código de acompanhamento:* ${details.trackingCode}` : ''}

📱 *Acesse sua área do cliente:*
${clientLink}

Lá você pode acompanhar sua reserva e aceitar o contrato digital.

Estamos ansiosos para recebê-lo! Qualquer dúvida, estamos à disposição.`;
}

export function generateReminderMessage(details: ReservationDetails): string {
  const checkInFormatted = format(parseISO(details.checkIn), "dd 'de' MMMM", { locale: ptBR });
  const clientLink = getClientAreaLink(details.trackingCode);

  return `Olá ${details.guestName}! 👋

Lembrete: sua estadia em *${details.propertyName || 'setor g espaço vip'}* está chegando!

📅 *Check-in:* ${checkInFormatted}
${details.trackingCode ? `\n🔑 *Código de acompanhamento:* ${details.trackingCode}` : ''}

📱 *Área do cliente:* ${clientLink}

Confirme se está tudo certo para sua chegada. Até breve! 🏠`;
}

export function generatePaymentReminderMessage(details: ReservationDetails, pendingAmount: number): string {
  const pendingFormatted = pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const clientLink = getClientAreaLink(details.trackingCode);

  return `Olá ${details.guestName}! 👋

Gostaríamos de lembrar que há um saldo pendente de *R$ ${pendingFormatted}* referente à sua reserva.
${details.trackingCode ? `\n🔑 *Código de acompanhamento:* ${details.trackingCode}` : ''}

📱 *Acompanhe sua reserva:* ${clientLink}

Por favor, entre em contato para regularizar o pagamento. Obrigado! 🙏`;
}

export function generateCustomMessage(guestName: string): string {
  return `Olá ${guestName}! 👋

`;
}
