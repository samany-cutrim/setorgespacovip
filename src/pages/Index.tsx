import { Button } from "@/components/ui/button";
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
        <section className="w-full py-12 md:py-24 lg:py-32 bg-cover bg-center bg-no-repeat relative bg-[url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2698&auto=format&fit=crop')]">
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
        <p>&copy; {new Date().getFullYear()} Setor G Espaço VIP. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}