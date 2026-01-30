import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Setor G Espaço VIP</h1>
        <nav className="flex gap-4">
          <Link to="/login">
            <Button variant="secondary">Login</Button>
          </Link>
          <Link to="/client-area">
            <Button>Área do Cliente</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-cover bg-center" style={{ backgroundImage: "url('/placeholder.svg')" }}>
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-white">
                Bem-vindo ao Setor G Espaço VIP
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
                O lugar perfeito para seus eventos e confraternizações.
              </p>
              <Link to="/client-area">
                <Button size="lg">Faça sua Reserva</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-primary text-primary-foreground py-6 px-6 text-center">
        <p>&copy; 2024 Setor G Espaço VIP. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
