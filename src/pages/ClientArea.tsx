import { Link } from 'react-router-dom';

export default function ClientArea() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-4">Área do Cliente</h1>
      <p className="text-lg text-muted-foreground mb-8">Esta página está em construção.</p>
      <Link to="/" className="text-blue-500 hover:underline">Voltar para a página inicial</Link>
    </div>
  );
}
