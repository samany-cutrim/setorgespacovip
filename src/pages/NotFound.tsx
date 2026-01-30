import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-9xl font-bold text-primary">404</h1>
      <h2 className="text-2xl font-semibold text-muted-foreground mt-4">Página não encontrada</h2>
      <p className="text-muted-foreground mt-2">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link to="/" className="mt-6">
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
          Voltar para a Home
        </button>
      </Link>
    </div>
  );
}
