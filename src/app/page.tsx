import Counter from "@/components/Counter";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            Contador MCI
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Meu Contador Inteligente - Funcional e Moderno
          </p>
        </div>
        
        <Counter />
      </div>
    </main>
  );
}