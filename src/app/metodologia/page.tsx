import React from "react";
import {
  IconBook,
  IconCheck,
  IconShield,
  IconScale,
  IconNetwork,
  IconLock,
} from "@/components/Icons";

export default function MetodologiaPage() {
  const pipelineSteps = [
    { step: 1, title: "Coleta", desc: "Questionário com consentimento acadêmico na UPM" },
    { step: 2, title: "Pré-processamento", desc: "Limpeza, normalização e remoção imediata de PII" },
    { step: 3, title: "Análise Estatística", desc: "Estatística descritiva, medianas e frequências" },
    { step: 4, title: "K-Medoids (PAM)", desc: "Agrupamento não supervisionado baseado em hábitos" },
    { step: 5, title: "Validação", desc: "Cotovelo, Silhueta, Davies-Bouldin, Calinski e Dunn" },
    { step: 6, title: "Caracterização GAD-7", desc: "Análise a posteriori dos sintomas por perfil" },
    { step: 7, title: "Dashboard", desc: "Visualização espacial agregada com supressão n < 10" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <section className="bg-white rounded-md border border-gray-200 p-6 sm:p-7 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-50 text-[#EB0029] text-xs font-bold border border-red-100 mb-3 uppercase tracking-wider">
          <IconBook className="w-3.5 h-3.5" />
          Rigor Metodológico do TCC
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight uppercase">
          Metodologia e Pipeline Científico
        </h1>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          Procedimentos formais de coleta, anonimização, análise estatística e modelagem de agrupamento não supervisionado (K-Medoids) aplicados ao estudo de ansiedade na Universidade Presbiteriana Mackenzie.
        </p>
      </section>

      {/* 1. Pipeline Analítico Integrado */}
      <section className="bg-white rounded-md border border-gray-200 p-6 sm:p-7 shadow-xs space-y-4">
        <h2 className="font-bold text-[#1A1A1A] text-base flex items-center gap-2 border-b border-gray-100 pb-2">
          Fluxo do Pipeline de Dados e Modelagem
        </h2>

        {/* Visualização de Etapas Sequenciais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 pt-2">
          {pipelineSteps.map((s) => (
            <div key={s.step} className="bg-gray-50 p-3 rounded border border-gray-200 flex flex-col justify-between">
              <div>
                <span className="w-5 h-5 rounded bg-[#EB0029] text-white font-black text-[10px] flex items-center justify-center mb-1.5">
                  {s.step}
                </span>
                <span className="font-bold text-[#1A1A1A] text-xs block">{s.title}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1 leading-tight">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Instrumento de Rastreamento: GAD-7 */}
      <section className="bg-white rounded-md border border-gray-200 p-6 sm:p-7 shadow-xs space-y-3 text-xs leading-relaxed text-gray-600">
        <h2 className="font-bold text-[#1A1A1A] text-base flex items-center gap-2 border-b border-gray-100 pb-2">
          <IconScale className="w-4 h-4 text-[#EB0029]" />
          Escala Padronizada GAD-7
        </h2>
        <p>
          O <em>Generalized Anxiety Disorder 7-item</em> mensura a frequência de sintomas de ansiedade nas últimas duas semanas (0 = Nenhuma vez a 3 = Quase todos os dias), totalizando escore de 0 a 21 pontos:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-medium">
          <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded border border-emerald-200">
            <strong>0 a 4 pontos:</strong> Mínima
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-900 rounded border border-amber-200">
            <strong>5 a 9 pontos:</strong> Leve
          </div>
          <div className="p-2.5 bg-orange-50 text-orange-900 rounded border border-orange-200">
            <strong>10 a 14 pontos:</strong> Moderada
          </div>
          <div className="p-2.5 bg-red-50 text-[#EB0029] rounded border border-red-200">
            <strong>15 a 21 pontos:</strong> Grave
          </div>
        </div>
        <p className="text-[11px] text-gray-500 pt-1">
          * Ponto de corte padrão adotado para triagem positiva de sintomas clínicos: Score ≥ 10.
        </p>
      </section>

      {/* 3. Aprendizado Não Supervisionado e Métricas de Validação */}
      <section className="bg-white rounded-md border border-gray-200 p-6 sm:p-7 shadow-xs space-y-4 text-xs leading-relaxed text-gray-600">
        <h2 className="font-bold text-[#1A1A1A] text-base flex items-center gap-2 border-b border-gray-100 pb-2">
          <IconNetwork className="w-4 h-4 text-[#EB0029]" />
          Agrupamento K-Medoids (PAM) e Seleção de K_FINAL
        </h2>

        <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-1">
          <strong className="text-[#1A1A1A] font-bold block">Exclusão do GAD-7 na Formação dos Grupos:</strong>
          <p>
            O GAD-7 <strong>não é utilizado</strong> para definir os perfis. Os clusters são construídos exclusivamente a partir de variáveis de hábitos (sono, qualidade, atividade física, alimentação, estudo e lazer). A distribuição dos sintomas de ansiedade é analisada unicamente a posteriori.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-1">
            <strong className="text-[#1A1A1A] block font-semibold">Método do Cotovelo (Inércia)</strong>
            <p className="text-[11px] text-gray-500">Identificação do ponto de inflexão no decaimento da variância interna intra-cluster.</p>
          </div>
          <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-1">
            <strong className="text-[#1A1A1A] block font-semibold">Silhouette Score</strong>
            <p className="text-[11px] text-gray-500">Avalia a coesão de cada elemento com seu grupo em relação ao grupo vizinho mais próximo.</p>
          </div>
          <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-1">
            <strong className="text-[#1A1A1A] block font-semibold">Davies-Bouldin &amp; Calinski-Harabasz</strong>
            <p className="text-[11px] text-gray-500">Razões de similaridade e dispersão inter-cluster versus intra-cluster.</p>
          </div>
          <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-1">
            <strong className="text-[#1A1A1A] block font-semibold">Dunn Index &amp; Estabilidade ARI</strong>
            <p className="text-[11px] text-gray-500">Razão extrema de separação e avaliação de reprodutibilidade por reamostragem (Adjusted Rand Index).</p>
          </div>
        </div>
      </section>

      {/* 4. Modelos Multivariados Ajustados e Testes de Associação */}
      <section className="bg-white rounded-md border border-gray-200 p-6 sm:p-7 shadow-xs space-y-4 text-xs leading-relaxed text-gray-600">
        <h2 className="font-bold text-[#1A1A1A] text-base flex items-center gap-2 border-b border-gray-100 pb-2">
          <IconCheck className="w-4 h-4 text-emerald-700" />
          Modelos Estatísticos Ajustados e Controle de Confusão (OLS HC3 &amp; Poisson Robusto)
        </h2>
        <p>
          Para verificar se as variações de ansiedade decorrem de características institucionais (como Curso, Modalidade ou Turno) ou se são impulsionadas pelo estilo de vida, foram ajustados modelos de regressão multivariada controlados por escores ordinais de rotina:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600 bg-gray-50">
                <th className="py-2.5 px-3 font-bold text-gray-700">Dimensão Analisada</th>
                <th className="py-2.5 px-3 font-bold text-gray-700">Comparação</th>
                <th className="py-2.5 px-3 font-bold text-center text-gray-700">Diferença GAD-7 (IC95%)</th>
                <th className="py-2.5 px-3 font-bold text-center text-gray-700">Razão de Prevalência RP (IC95%)</th>
                <th className="py-2.5 px-3 font-bold text-center text-gray-700">p-valor Ajustado (BH)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              <tr className="hover:bg-gray-50/70">
                <td className="py-2.5 px-3 font-bold text-gray-800">Curso</td>
                <td className="py-2.5 px-3 text-gray-600">ADS vs. Ciência / Sistemas</td>
                <td className="py-2.5 px-3 text-center font-mono">-0.05 (-3.38 a 3.29)</td>
                <td className="py-2.5 px-3 text-center font-mono">0.88 (0.39 a 2.00)</td>
                <td className="py-2.5 px-3 text-center text-gray-500 font-bold font-mono">0.978 (n.s.)</td>
              </tr>
              <tr className="hover:bg-gray-50/70">
                <td className="py-2.5 px-3 font-bold text-gray-800">Modalidade</td>
                <td className="py-2.5 px-3 text-gray-600">EaD vs. Presencial</td>
                <td className="py-2.5 px-3 text-center font-mono">+0.91 (-1.23 a 3.04)</td>
                <td className="py-2.5 px-3 text-center font-mono">1.06 (0.72 a 1.56)</td>
                <td className="py-2.5 px-3 text-center text-gray-500 font-bold font-mono">0.978 (n.s.)</td>
              </tr>
              <tr className="hover:bg-gray-50/70">
                <td className="py-2.5 px-3 font-bold text-gray-800">Turno</td>
                <td className="py-2.5 px-3 text-gray-600">Noturno vs. Matutino</td>
                <td className="py-2.5 px-3 text-center font-mono">+0.80 (-1.33 a 2.93)</td>
                <td className="py-2.5 px-3 text-center font-mono">0.96 (0.68 a 1.36)</td>
                <td className="py-2.5 px-3 text-center text-gray-500 font-bold font-mono">0.978 (n.s.)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-emerald-950 text-[11px] leading-relaxed">
          <strong>Conclusão Epistemológica Central:</strong> Após o controle estatístico pelos hábitos de vida individuais (duração/qualidade de sono, atividade física e tempo de descanso), <strong>não foram encontradas diferenças estatisticamente significativas</strong> associadas ao curso, modalidade ou turno. Isso demonstra que os desfechos em saúde mental na população universitária estudada são predominantemente impulsionados pelas variáveis de rotina e autocuidado.
        </div>
      </section>

      {/* 5. Privacidade e Supressão */}
      <section className="bg-white rounded-md border border-gray-200 p-6 sm:p-7 shadow-xs space-y-3 text-xs leading-relaxed text-gray-600">
        <h2 className="font-bold text-[#1A1A1A] text-base flex items-center gap-2 border-b border-gray-100 pb-2">
          <IconLock className="w-4 h-4 text-[#EB0029]" />
          Privacidade Diferencial e Supressão Ética (n &lt; 10)
        </h2>
        <p>
          Nenhum dado individual ou informação de identificação pessoal (PII) é enviado ao navegador. Toda e qualquer combinação de filtros ou unidade acadêmica com menos de 10 respondentes é estritamente suprimida, assegurando conformidade com a LGPD e a ética da pesquisa científica.
        </p>
      </section>
    </div>
  );
}
