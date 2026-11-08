import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mapa da Ansiedade — Campus Higienópolis | UPM",
  description:
    "Análise agregada e anônima de hábitos, rotina acadêmica e sintomas de ansiedade (GAD-7) em estudantes universitários da Universidade Presbiteriana Mackenzie.",
  authors: [
    { name: "Bruno Antico Galin" },
    { name: "Gustavo Fugulin Soares da Silva" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col bg-[#F4F6F8] text-[#1A1A1A] selection:bg-[#EB0029] selection:text-white">
        {/* Barra Superior Institucional Oficial Mackenzie */}
        <div className="bg-[#EB0029] text-white text-[11px] font-semibold tracking-wider py-1.5 px-4 sm:px-6 lg:px-8 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider">Universidade Presbiteriana Mackenzie</span>
              <span className="opacity-60 hidden sm:inline">|</span>
              <span className="opacity-95 font-normal hidden sm:inline">Campus Higienópolis — São Paulo</span>
            </div>
            <div className="text-[10px] sm:text-[11px] font-medium text-white/95">
              Portal do TCC • FCI
            </div>
          </div>
        </div>

        {/* Cabeçalho Acadêmico Institucional */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-40 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-2.5">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
                <img
                  src="/brand/mackenzie-logo.png"
                  alt="Universidade Presbiteriana Mackenzie"
                  className="h-8 sm:h-9 w-auto object-contain transition-opacity group-hover:opacity-90"
                />
                <div className="h-7 w-[1px] bg-gray-200 hidden sm:block"></div>
                <img
                  src="/brand/fci-logo.png"
                  alt="Faculdade de Computação e Informática"
                  className="h-8 sm:h-9 w-auto object-contain hidden sm:block transition-opacity group-hover:opacity-90"
                />
              </Link>
              <div className="border-l border-gray-200 pl-3 hidden md:block">
                <span className="font-black text-[#1A1A1A] text-sm block leading-tight tracking-tight uppercase">
                  Mapa da Ansiedade
                </span>
                <span className="text-[11px] font-medium text-gray-500 block leading-tight">
                  TCC • Ciência da Computação
                </span>
              </div>
            </div>

            <nav className="flex items-center gap-1 sm:gap-1.5">
              <Link
                href="/"
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#EB0029] hover:bg-gray-50 rounded transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/perfis"
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#EB0029] hover:bg-gray-50 rounded transition-colors"
              >
                Perfis Comportamentais
              </Link>
              <Link
                href="/metodologia"
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#EB0029] hover:bg-gray-50 rounded transition-colors"
              >
                Metodologia
              </Link>
            </nav>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Rodapé Ético e Institucional com Assinatura da UPM, Autores e Orientadora */}
        <footer className="border-t border-gray-200 bg-white py-6 text-xs text-gray-500 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-100 text-center md:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/brand/mackenzie-logo.png"
                    alt="Universidade Presbiteriana Mackenzie"
                    className="h-7 w-auto object-contain opacity-90"
                  />
                  <div className="h-5 w-[1px] bg-gray-300"></div>
                  <img
                    src="/brand/fci-logo.png"
                    alt="Faculdade de Computação e Informática"
                    className="h-7 w-auto object-contain opacity-90"
                  />
                </div>
                <div className="text-[11px] text-gray-600 leading-snug">
                  <span className="font-bold text-gray-800">Universidade Presbiteriana Mackenzie</span> • FCI • Campus Higienópolis
                </div>
              </div>

              {/* Assinatura dos Autores e Orientadora */}
              <div className="text-[11px] text-gray-600 text-center md:text-right space-y-0.5">
                <div>
                  <span className="text-gray-500 font-medium">Autores:</span>{" "}
                  <strong className="text-gray-900 font-semibold">Bruno Antico Galin</strong>{" "}
                  <span className="text-gray-400">•</span>{" "}
                  <strong className="text-gray-900 font-semibold">Gustavo Fugulin Soares da Silva</strong>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Orientadora:</span>{" "}
                  <strong className="text-[#EB0029] font-semibold">Profª. Dra. Carolina Toledo Ferraz</strong>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-400 text-center sm:text-left">
              <div>
                Trabalho de Conclusão de Curso (TCC) • Bacharelado em Ciência da Computação
              </div>
              <div>
                Proteção Ética e LGPD: supressão amostral para recortes com <span className="font-mono text-gray-700 font-bold">n &lt; 10</span>.
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
