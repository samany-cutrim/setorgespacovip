import { Button } from "@/components/ui/button";
import { MessageCircle, Instagram, Linkedin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import ReservationSection from "@/components/shared/ReservationSection";

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-primary text-primary-foreground py-4 px-6 flex justify-between items-center shadow-md sticky top-0 z-20">
        <h1 className="text-2xl font-bold">Setor G Espaço VIP</h1>
        <nav className="flex gap-4">
          <Link to="/client-area">
            <Button variant="secondary">Área do Cliente</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary">Admin Login</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-8 md:py-16 lg:py-20 bg-cover bg-no-repeat relative bg-[url('/piscina.jpeg')] bg-[position:50%_75%]">
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="container relative px-4 md:px-6 mx-auto text-center text-white">
             <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-4">
                Bem-vindo ao Setor G Espaço VIP
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl mb-8">
                O lugar perfeito para seus eventos e confraternizações. Verifique a disponibilidade abaixo e reserve sua data.
              </p>
          </div>
        </section>
        
        <ReservationSection />

        <section className="container mx-auto py-10 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">Avaliações no Google</CardTitle>
                <CardDescription>Veja o que nossos clientes dizem sobre nós.</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href="https://share.google/MIl5tQMGF5wfBTJ3b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary font-semibold hover:underline"
                >
                  Ver Avaliações
                </a>
              </CardContent>
            </Card>

            <Card className="shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">Siga-nos no Instagram</CardTitle>
                <CardDescription>Acompanhe nossas novidades e veja fotos de eventos.</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href="https://www.instagram.com/setorgespaco_vip/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary font-semibold hover:underline"
                >
                  @setorgespaco_vip
                </a>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-primary-foreground py-6 px-6 text-center mt-auto">
        <div className="container mx-auto flex flex-col items-center gap-3 text-sm">
          <p>&copy; {new Date().getFullYear()} Setor G Espaço VIP. Todos os direitos reservados.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span>Desenvolvido por Samany Cutrim</span>
            <a
              href="https://wa.me/5511958462009"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-white/90"
            >
              <MessageCircle className="h-4 w-4" />
              (11) 95846-2009
            </a>
            <a
              href="https://www.instagram.com/samanycutrim/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-white/90"
            >
              <Instagram className="h-4 w-4" />
              @samanycutrim
            </a>
            <a
              href="https://www.linkedin.com/in/samanycutrim/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-white/90"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </a>
          </div>
        </div>
      </footer>

      <a
        href="https://wa.me/message/IHJSYV4FYDSUB1"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50"
        aria-label="WhatsApp"
      >
        <Button className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg">
          <MessageCircle className="h-6 w-6" />
        </Button>
      </a>
    </div>
  );
}