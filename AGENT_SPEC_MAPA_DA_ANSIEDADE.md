# AGENT_SPEC.md — Dashboard Interativo "Mapa da Ansiedade"

> Documento de implementação para agente de desenvolvimento (Antigravity).
> Projeto acadêmico: TCC — Mapa da Ansiedade em Estudantes Universitários
> Universidade Presbiteriana Mackenzie — Ciência da Computação
> Idioma da interface: pt-BR
> Status: especificação para implementação do MVP e deploy público

---

## 0. INSTRUÇÃO PRINCIPAL AO AGENTE

Implemente este projeto como uma aplicação web interativa, responsiva e publicável na Vercel.

Antes de alterar qualquer arquivo existente:

1. Inspecione o repositório.
2. Preserve notebooks, arquivos acadêmicos e dados originais.
3. Não publique nem commite dados pessoais ou respostas individuais.
4. Não coloque a planilha bruta dentro de `/public`.
5. Não implemente aprendizado supervisionado (regressão, árvore de decisão, predição alto/baixo risco) no dashboard final.
6. O dashboard deve apresentar análises descritivas, estatísticas agregadas e resultados do aprendizado não supervisionado (clusters).
7. O GAD-7 NÃO pode ser usado para formar os clusters. Ele é usado apenas depois, para caracterizar a distribuição dos sintomas em cada perfil.
8. Qualquer recorte com `n < 10` deve ser suprimido na interface.
9. Se algum requisito estiver ambíguo, implemente a opção mais simples e deixe um `TODO` explícito, sem inventar dados.
10. Priorize legibilidade acadêmica, rastreabilidade dos dados, acessibilidade e privacidade.

---

# 1. OBJETIVO DO PRODUTO

Criar um dashboard web chamado **Mapa da Ansiedade** para explorar, de forma agregada e anônima, os resultados da pesquisa aplicada a estudantes universitários da Universidade Presbiteriana Mackenzie.

O produto deve responder visualmente às perguntas:

1. Como os sintomas de ansiedade medidos pelo GAD-7 se distribuem na amostra?
2. Como hábitos e rotina acadêmica se relacionam descritivamente com esses sintomas?
3. Quais perfis comportamentais foram identificados pelo agrupamento não supervisionado?
4. Como o GAD-7 se distribui entre esses perfis?
5. Como esses indicadores variam entre unidades acadêmicas/faculdades?
6. É possível navegar pelas unidades acadêmicas usando um mapa visual do Campus Higienópolis?

O dashboard não é uma ferramenta diagnóstica e não deve sugerir diagnóstico clínico individual.

---

# 2. PRINCÍPIO VISUAL DO DASHBOARD

A interface principal deve ser construída ao redor de um **mapa vetorial esquemático do Campus Higienópolis**.

Cada unidade acadêmica/prédio elegível deve funcionar como uma região clicável no mapa.

Ao selecionar uma unidade:

- destacar o prédio no SVG;
- abrir um painel lateral/detalhe;
- mostrar apenas estatísticas agregadas;
- atualizar gráficos relacionados ao filtro;
- mostrar `Amostra insuficiente para exibição` quando o grupo filtrado possuir menos de 10 respostas.

IMPORTANTE:

- Não usar Google Maps ou Mapbox como mapa principal.
- O campus é um espaço fechado e o objetivo é navegação acadêmica, não geolocalização.
- Criar um SVG próprio e simplificado.
- Usar o mapa oficial do Mackenzie apenas como referência espacial.
- Não copiar/tracar pixel a pixel a arte oficial.
- Incluir uma nota de fonte/referência ao mapa institucional.

Referência pública:
https://www.mackenzie.br/fileadmin/ARQUIVOS/Public/top/atendimento/central-informacoes/mapa_campus_higienopolis.pdf

---

# 3. MAPEAMENTO INICIAL DE UNIDADES ACADÊMICAS

Criar um arquivo configurável:

`src/config/academic-units.ts`

Estrutura sugerida:

```ts
export type AcademicUnit = {
  id: string;
  acronym: string;
  name: string;
  buildingIds: string[];
  primaryBuildingId?: string;
  enabledOnMap: boolean;
};

export const academicUnits: AcademicUnit[] = [
  {
    id: "fci",
    acronym: "FCI",
    name: "Faculdade de Computação e Informática",
    buildingIds: ["31"],
    primaryBuildingId: "31",
    enabledOnMap: true,
  },
  {
    id: "fdir",
    acronym: "FDIR",
    name: "Faculdade de Direito",
    buildingIds: ["3", "24"],
    primaryBuildingId: "3",
    enabledOnMap: true,
  },
  {
    id: "ccbs",
    acronym: "CCBS",
    name: "Centro de Ciências Biológicas e da Saúde",
    buildingIds: ["50", "38"],
    primaryBuildingId: "50",
    enabledOnMap: true,
  },
  {
    id: "ccl",
    acronym: "CCL",
    name: "Centro de Comunicação e Letras",
    buildingIds: ["49", "48"],
    primaryBuildingId: "49",
    enabledOnMap: true,
  },
];
```

Notas:

- FCI: Prédio 31 é identificado no mapa institucional como Faculdade de Computação e Informática.
- FDIR: Prédio 3 aparece como Direito; o Prédio 24 também possui atividades da Faculdade de Direito.
- CCBS: há múltiplos prédios/laboratórios relacionados ao CCBS. Usar `primaryBuildingId = "50"` inicialmente e manter a configuração editável.
- CCL: Prédio 49 é identificado como CCL; Prédio 48 também possui atividades do CCL.
- EaD NÃO deve ser representado como prédio físico.
- Caso existam respostas de outros campi, não posicioná-las artificialmente no Campus Higienópolis.
- Unidades sem amostra suficiente podem aparecer no mapa, mas o painel deve exibir apenas “Amostra insuficiente”.

Referência adicional de unidades acadêmicas:
https://www.mackenzie.br/fileadmin/ARQUIVOS/Public/1-mackenzie/universidade/controle-academico/2025/Cola%C3%A7%C3%A3o_de_Grau/Formandos_2sem.2025/Cronograma_cola%C3%A7%C3%A3o_de_grau/%E2%80%A2CGP_-_Formandos_2_sem2025_Publica%C3%A7%C3%A3o_24.10.25.pdf

---

# 4. FONTE DOS DADOS

Arquivo bruto atual:

`Mapa da Ansiedade_ análise de dados em estudantes universitários(1-192).xlsx`

A planilha contém 192 respostas e 33 colunas na versão atual.

Colunas originais:

```text
ID
Hora de início
Hora de conclusão
Email
Nome
Hora da última modificação
Li e concordo em participar
Tenho 18 anos ou mais
Instituição
Campus
Curso/Faculdade
Área de Conhecimento
Turno
Semestre Atual
Trabalha atualmente?
Horas de sono por noite
Qualidade do sono (últimas 2 semanas)
Atividade física semanal
Alimentação adequada (autoavaliação)
Carga diária de estudos fora da aula
Tempo de lazer/descanso por dia
Média de notas
Faltas recorrentes neste semestre
Trancou disciplina no último ano?
Atividades complementares/monitoria/iniciação
Sentir-se nervoso(a), ansioso(a) ou “no limite”.
Não conseguir parar ou controlar a preocupação.
Preocupar-se demais com diferentes coisas.
Dificuldade para relaxar.
Ficar tão agitado(a) que é difícil permanecer sentado(a) parado(a).
Tornar-se facilmente irritado(a) ou impaciente.
Sentir medo como se algo terrível pudesse acontecer.
Autorizo o uso acadêmico e publicação de resultados agregados e anônimos.
```

NUNCA enviar para o frontend:

- Nome
- Email
- ID
- timestamps individuais
- respostas individuais do GAD-7
- qualquer linha individual da pesquisa

---

# 5. NORMALIZAÇÃO DOS DADOS

Não usar diretamente o campo bruto `Curso/Faculdade` como unidade acadêmica.

O notebook atual contém respostas heterogêneas, incluindo curso, faculdade e modalidade no mesmo campo.

Exemplos observados:

```text
FCI (Ciência da Computação/Sistemas de Informação)
Banco de dados
Tecnologia em Banco de Dados
Direito
direito FDIR
DIREITO
Licenciatura em Matemática
FCI Banco de Dados
Análise e Desenvolvimento de Sistemas
ADS
PP
MKT
Nutrição
CCBS / Nutrição
CCBS (Nutrição)
...
```

Criar na camada de preparação dos dados os campos normalizados:

```text
campus_normalizado
unidade_academica
curso_normalizado
modalidade
turno
semestre
cluster
```

Não misturar `EaD` com unidade acadêmica.

Exemplo:

```text
unidade_academica = FCI
modalidade = EaD
curso_normalizado = Análise e Desenvolvimento de Sistemas
```

ou, conforme o dado real:

```text
unidade_academica = CCBS
modalidade = Presencial
curso_normalizado = Nutrição
```

A normalização final deve reutilizar, quando possível, as regras consolidadas no notebook do TCC.

---

# 6. GAD-7

O dashboard deve trabalhar com:

- `gad7_score`: 0–21
- `gad7_level`:
  - 0–4: Mínima
  - 5–9: Leve
  - 10–14: Moderada
  - 15–21: Grave

O GAD-7 NÃO é diagnóstico clínico.

Adicionar na interface:

> “Os resultados apresentados correspondem a uma escala de rastreamento de sintomas de ansiedade e não constituem diagnóstico clínico.”

O GAD-7 NÃO participa da criação dos clusters.

---

# 7. CLUSTERS

O dashboard deve consumir o resultado FINAL do pipeline de clustering do notebook.

Não recalcular clustering no navegador.

Não definir nomes de clusters antes de o notebook definir o `K_FINAL`.

Esperar um arquivo processado com, no mínimo:

```text
cluster_id
cluster_label
cluster_description
cluster_n
```

Os nomes devem ser baseados SOMENTE nas variáveis usadas no agrupamento:

- horas de sono;
- qualidade do sono;
- atividade física;
- alimentação;
- carga de estudos;
- tempo de lazer.

Nunca nomear cluster como:

- “cluster de alta ansiedade”;
- “cluster ansioso”;
- “cluster depressivo”.

O GAD-7 é analisado posteriormente.

Exemplo de nomenclatura aceitável:

```text
Perfil 1 — Sono adequado e maior lazer
Perfil 2 — Sono reduzido e baixa atividade física
Perfil 3 — Sono ruim e alimentação menos adequada
```

Esses nomes são apenas exemplos. Não hardcodar até a análise final.

---

# 8. ARQUITETURA RECOMENDADA

## Frontend

- Next.js, versão estável disponível no ambiente
- App Router
- TypeScript
- Tailwind CSS
- Recharts para gráficos principais
- Lucide React para ícones
- SVG nativo para mapa
- opcional: shadcn/ui para primitives de UI

Evitar dependências pesadas sem necessidade.

## Backend

MVP preferencialmente sem banco.

Fluxo:

```text
XLSX privado
    ↓
script Python local
    ↓
normalização + cálculo GAD + clusters finais
    ↓
agregação + anonimização + supressão n<10
    ↓
JSON estático seguro
    ↓
Next.js
    ↓
Vercel
```

Não implantar a planilha bruta na Vercel.

---

# 9. ESTRUTURA DE PASTAS

Criar uma estrutura próxima desta:

```text
/
├─ AGENT_SPEC.md
├─ README.md
├─ .gitignore
├─ data/
│  ├─ private/
│  │  └─ .gitkeep
│  └─ processed/
│     └─ .gitkeep
├─ scripts/
│  └─ build_dashboard_data.py
├─ public/
│  ├─ data/
│  │  ├─ overview.json
│  │  ├─ academic-units.json
│  │  ├─ clusters.json
│  │  └─ filter-cube.json
│  └─ campus/
│     └─ campus-higienopolis.svg
├─ src/
│  ├─ app/
│  │  ├─ page.tsx
│  │  ├─ perfis/
│  │  │  └─ page.tsx
│  │  ├─ metodologia/
│  │  │  └─ page.tsx
│  │  └─ layout.tsx
│  ├─ components/
│  │  ├─ dashboard/
│  │  │  ├─ CampusMap.tsx
│  │  │  ├─ MetricsBar.tsx
│  │  │  ├─ UnitDetailsPanel.tsx
│  │  │  ├─ GadDistributionChart.tsx
│  │  │  ├─ GadScoreChart.tsx
│  │  │  ├─ ClusterDistributionChart.tsx
│  │  │  ├─ ClusterProfileHeatmap.tsx
│  │  │  ├─ FiltersBar.tsx
│  │  │  └─ SampleSizeWarning.tsx
│  │  └─ ui/
│  ├─ config/
│  │  ├─ academic-units.ts
│  │  ├─ buildings.ts
│  │  └─ privacy.ts
│  ├─ lib/
│  │  ├─ data.ts
│  │  ├─ filters.ts
│  │  ├─ privacy.ts
│  │  └─ format.ts
│  └─ types/
│     └─ dashboard.ts
└─ tests/
```

---

# 10. PRIVACIDADE E SUPRESSÃO

Constante global:

```ts
export const MIN_PUBLIC_SAMPLE_SIZE = 10;
```

Regra:

```ts
if (record.n < MIN_PUBLIC_SAMPLE_SIZE) {
  return {
    status: "suppressed",
    n: record.n,
    message: "Amostra insuficiente para exibição"
  };
}
```

Não exibir para grupos suprimidos:

- média GAD-7;
- mediana;
- proporção por nível;
- distribuição por cluster;
- qualquer subdivisão que permita inferência individual.

Mostrar apenas:

```text
Amostra insuficiente para exibição
```

Não permitir download de dados brutos.

---

# 11. CUBO DE DADOS AGREGADOS

Para permitir filtros sem expor linhas individuais, gerar localmente combinações agregadas.

Dimensões iniciais:

```text
unidade_academica
turno
semestre
trabalha
cluster_id
```

O script Python deve gerar agregações para combinações possíveis dessas dimensões.

Cada registro público pode ter:

```json
{
  "filters": {
    "unidade_academica": "FCI",
    "turno": "Noturno",
    "semestre": null,
    "trabalha": null,
    "cluster_id": null
  },
  "n": 62,
  "suppressed": false,
  "gad7": {
    "mean": 10.7,
    "median": 11.0,
    "std": 5.2,
    "levels": {
      "minima": 0.18,
      "leve": 0.26,
      "moderada": 0.31,
      "grave": 0.25
    }
  }
}
```

Números acima são apenas exemplo de estrutura. Nunca usar dados fictícios como resultado real.

O script deve remover/suprimir qualquer combinação com `n < 10`.

---

# 12. SCRIPT DE PREPARAÇÃO

Criar:

`scripts/build_dashboard_data.py`

Responsabilidades:

1. localizar o XLSX em `data/private/`;
2. validar colunas obrigatórias;
3. remover PII imediatamente;
4. aplicar critérios de elegibilidade;
5. normalizar categorias;
6. calcular GAD-7;
7. importar/aplicar cluster final;
8. produzir agregados;
9. aplicar supressão;
10. salvar apenas JSON seguro em `/public/data`.

O script deve falhar explicitamente se:

- a planilha não existir;
- colunas obrigatórias estiverem ausentes;
- cluster final não estiver disponível quando exigido;
- alguma saída pública contiver Nome, Email ou ID.

Implementar uma validação automática:

```python
FORBIDDEN_PUBLIC_COLUMNS = {
    "Nome",
    "Email",
    "ID",
}
```

---

# 13. HOME — LAYOUT

Desktop:

```text
┌─────────────────────────────────────────────────────────────┐
│ Mapa da Ansiedade                           Metodologia     │
│ UPM • Campus Higienópolis                                  │
├─────────────────────────────────────────────────────────────┤
│ Filtros: Turno | Semestre | Trabalho | Cluster             │
├─────────────────────────────────────────────────────────────┤
│ n total │ GAD médio │ Mediana │ % Moderada/Grave           │
├────────────────────────────────┬────────────────────────────┤
│                                │ Unidade selecionada        │
│      MAPA SVG DO CAMPUS        │ FCI — Prédio 31           │
│                                │ n = ...                    │
│  prédios clicáveis             │ GAD médio = ...            │
│  intensidade pela métrica      │ níveis = ...               │
│                                │ cluster dominante = ...     │
├────────────────────────────────┴────────────────────────────┤
│ Distribuição GAD-7              | Distribuição de clusters  │
├─────────────────────────────────────────────────────────────┤
│ Comparação unidade × amostra geral                          │
└─────────────────────────────────────────────────────────────┘
```

Mobile:

- KPIs em cards horizontais/scroll;
- mapa em largura total;
- ao clicar no prédio, abrir bottom-sheet/drawer;
- gráficos empilhados verticalmente.

---

# 14. MAPA SVG

Criar `public/campus/campus-higienopolis.svg`.

Cada prédio deve possuir um ID estável:

```html
<g id="building-31" data-building-id="31">
  <path ... />
</g>
```

O React deve controlar:

- hover;
- selected;
- disabled;
- suppressed;
- intensity.

Estados visuais:

```text
default     → neutro
hover       → destaque
selected    → contorno forte
has-data    → escala da métrica
suppressed  → cinza/hachurado
no-data     → neutro claro
```

Acessibilidade:

- cada prédio clicável deve ser focável por teclado;
- `aria-label`;
- `role="button"` quando aplicável;
- tooltip não pode ser a única fonte de informação.

---

# 15. TOOLTIP DO PRÉDIO

Exemplo:

```text
FCI
Faculdade de Computação e Informática
Prédio 31

Amostra: 146
Clique para explorar
```

Se `n < 10`:

```text
FDIR
Faculdade de Direito
Prédio 3

Amostra insuficiente para exibição
```

Não mostrar métricas sensíveis no hover se o grupo for suprimido.

---

# 16. MÉTRICA DE COLORAÇÃO DO MAPA

Adicionar seletor:

```text
Colorir mapa por:
[ GAD-7 médio ▼ ]
```

Opções MVP:

- GAD-7 médio
- % mínimo
- % leve
- % moderado
- % grave
- % moderada + grave

Posteriormente:

- cluster mais frequente;
- qualidade de sono média/ordinal;
- outros indicadores.

IMPORTANTE:
A escala visual deve ser calculada apenas entre unidades não suprimidas.

---

# 17. CARDS/KPIs

Visão geral:

- Total de respostas válidas
- GAD-7 médio
- GAD-7 mediano
- % Mínima
- % Leve
- % Moderada
- % Grave

Ao selecionar unidade:

- `n`
- média
- mediana
- distribuição por nível
- cluster mais frequente, se permitido

Sempre identificar claramente se o card representa:

```text
Amostra geral
```

ou:

```text
FCI — filtro atual
```

---

# 18. GRÁFICOS DA HOME

## A. Distribuição GAD-7

Barras:

```text
Mínima
Leve
Moderada
Grave
```

Exibir:

- percentual;
- n;
- tooltip.

## B. Escore GAD-7

Pode ser:

- histograma;
- boxplot;
- violin plot se a biblioteca escolhida suportar sem peso excessivo.

## C. Distribuição dos clusters

Barra horizontal ou donut.

Mostrar:

```text
Perfil 1 — <nome final>
Perfil 2 — <nome final>
...
```

## D. Unidade × Amostra geral

Comparar:

- GAD médio;
- proporção moderada/grave;
- perfil de clusters.

Não sugerir causalidade.

---

# 19. PÁGINA `/perfis`

Objetivo: apresentar aprendizado não supervisionado.

Elementos:

1. descrição acadêmica curta;
2. número final de clusters;
3. tamanho de cada cluster;
4. cards de perfil;
5. heatmap das características padronizadas;
6. distribuição GAD-7 por cluster;
7. boxplot do GAD-7 por cluster;
8. barras empilhadas com níveis Mínima/Leve/Moderada/Grave;
9. métricas de validação do `K_FINAL`.

Não exibir resultados de modelos supervisionados.

---

# 20. CARD DE CLUSTER

Formato:

```text
Perfil 2 — Sono reduzido e baixa atividade
n = 36

Características mais distintivas:
• Sono: ...
• Qualidade: ...
• Atividade física: ...
• Alimentação: ...
• Carga de estudos: ...
• Lazer: ...

GAD-7 após formação do perfil:
Média: ...
Mediana: ...

Distribuição:
Mínima ...
Leve ...
Moderada ...
Grave ...
```

A descrição do perfil deve ser gerada a partir do output real do notebook, não inventada manualmente pelo frontend.

---

# 21. PÁGINA `/metodologia`

Explicar de maneira leiga, porém tecnicamente correta:

## Amostra
- origem;
- critérios de tratamento;
- anonimização.

## GAD-7
- escala 0–21;
- quatro faixas;
- rastreamento, não diagnóstico.

## Análise estatística
- síntese da abordagem usada no TCC.

## Clustering
- features usadas;
- K-Medoids/PAM;
- GAD-7 excluído da formação;
- escolha de K;
- Elbow;
- Silhouette;
- Davies-Bouldin;
- Calinski-Harabasz;
- Dunn;
- estabilidade, caso implementada.

## Privacidade
- dados agregados;
- supressão `n < 10`;
- ausência de respostas individuais.

---

# 22. FILTROS

Filtros públicos iniciais:

- Unidade Acadêmica
- Turno
- Semestre
- Situação de trabalho
- Cluster

Não incluir inicialmente filtros excessivamente granulares.

Ao alterar filtros:

1. buscar combinação no `filter-cube.json`;
2. verificar `n`;
3. se `n < 10`, suprimir;
4. atualizar cards, mapa e gráficos;
5. manter o filtro visível na URL quando viável.

Exemplo:

```text
/?turno=Noturno&cluster=2
```

---

# 23. ESTADO DA URL

Usar query params para permitir compartilhar uma visão do dashboard.

Exemplo:

```text
/?unit=FCI&turno=Noturno
```

Nunca colocar identificador individual na URL.

---

# 24. DESIGN SYSTEM

Direção visual:

- acadêmico;
- contemporâneo;
- limpo;
- sóbrio;
- acessível;
- inspirado na identidade visual do Mackenzie sem tentar reproduzir elementos institucionais protegidos como se o dashboard fosse um produto oficial da universidade.

Base sugerida:

```text
background: branco / cinza muito claro
text: grafite
accent: vermelho escuro inspirado no contexto Mackenzie
risk scale: sequencial, acessível e não alarmista
```

Evitar:

- “vermelho = pessoa doente”;
- ícones de alerta em excesso;
- linguagem diagnóstica;
- gamificação.

Adicionar no rodapé:

> Projeto acadêmico de TCC. Não representa ferramenta oficial de diagnóstico ou serviço clínico da Universidade Presbiteriana Mackenzie.

---

# 25. ACESSIBILIDADE

Requisitos mínimos:

- contraste WCAG AA;
- navegação por teclado;
- texto alternativo/aria nos gráficos;
- mapa navegável por teclado;
- não depender exclusivamente de cor;
- tooltip + informação textual;
- fontes >= 14px em conteúdo;
- layout mobile funcional.

---

# 26. PERFORMANCE

Meta inicial:

- Lighthouse Performance >= 90 em desktop quando possível;
- sem chamadas externas desnecessárias;
- JSON agregado pequeno;
- SVG otimizado;
- lazy-load em gráficos abaixo da dobra;
- preferir Server Components quando não houver interatividade;
- usar Client Components somente onde necessário.

---

# 27. DEPLOY NA VERCEL

Fluxo:

```text
GitHub
  ↓
Vercel
  ↓
Preview Deploy por PR
  ↓
Production Deploy na branch principal
```

Não depender de banco no MVP.

Configuração:

- framework: Next.js;
- build padrão;
- dados públicos agregados versionados em `/public/data`;
- dados privados fora do Git.

Criar `.gitignore` com:

```gitignore
data/private/*
!data/private/.gitkeep

*.xlsx
*.xls
.env
.env.local
```

ATENÇÃO:
Se houver outros XLSX legítimos no repo que precisem ser versionados, substituir a regra global por caminho específico.

---

# 28. ATUALIZAÇÃO DOS DADOS

Fluxo esperado:

```bash
# 1. colocar planilha localmente
data/private/coleta.xlsx

# 2. executar preparação
python scripts/build_dashboard_data.py

# 3. verificar outputs
public/data/*.json

# 4. executar testes
npm test

# 5. build
npm run build
```

O script deve imprimir resumo:

```text
Respostas lidas: X
Respostas elegíveis: X
Unidades acadêmicas: X
Clusters: X
Grupos suprimidos: X
Arquivos públicos gerados: X
```

---

# 29. TIPOS TYPESCRIPT

Criar tipos fortes.

Exemplo:

```ts
export type GadLevel = "minima" | "leve" | "moderada" | "grave";

export type GadSummary = {
  mean: number | null;
  median: number | null;
  std: number | null;
  levels: Record<GadLevel, number>;
};

export type DashboardAggregate = {
  n: number;
  suppressed: boolean;
  gad7: GadSummary | null;
  clusterDistribution?: Record<string, number>;
};

export type UnitSummary = {
  id: string;
  acronym: string;
  name: string;
  buildingIds: string[];
  data: DashboardAggregate;
};
```

---

# 30. NÃO FAZER

Não implementar no produto final:

- regressão logística;
- árvore de decisão supervisionada;
- predição individual;
- score “probabilidade de ansiedade”;
- ranking individual;
- recomendação médica;
- diagnóstico;
- exposição de linha individual;
- exportação da base bruta;
- heatmap de pessoas por prédio;
- geolocalização individual;
- números de grupos com n < 10.

---

# 31. MÉTRICAS DE CLUSTERING PARA EXIBIÇÃO

Na página de metodologia/perfis, apresentar o resultado FINAL do notebook:

- número de clusters escolhido;
- inércia/K-Medoids;
- Silhouette;
- Davies-Bouldin;
- Calinski-Harabasz;
- Dunn;
- estabilidade/ARI, se disponível.

Não executar a busca de K no frontend.

O frontend apenas apresenta resultados congelados e reproduzíveis gerados pelo notebook.

---

# 32. RELAÇÃO ENTRE NOTEBOOK E DASHBOARD

O notebook continua sendo a fonte analítica.

Separação de responsabilidades:

```text
NOTEBOOK
- limpeza
- estatística
- seleção de K
- clustering
- validação
- definição dos perfis
- cálculo GAD-7

DASHBOARD
- visualização
- interação
- filtros
- comparação agregada
- mapa
- comunicação dos resultados
```

O frontend NÃO deve reinterpretar ou modificar decisões analíticas.

---

# 33. TESTES

Criar testes para:

## Dados
- PII ausente de `/public/data`;
- todos os grupos públicos com `n >= 10`;
- soma das faixas GAD ≈ 1;
- score médio dentro de 0–21;
- cluster IDs válidos.

## Interface
- clique no prédio seleciona unidade;
- teclado seleciona prédio;
- grupo suprimido não mostra métricas;
- filtros atualizam dados;
- reset remove filtros;
- mobile drawer funciona.

---

# 34. CRITÉRIOS DE ACEITE DO MVP

O MVP é considerado concluído quando:

- [ ] projeto roda localmente;
- [ ] `npm run build` passa;
- [ ] mapa SVG aparece;
- [ ] FCI é clicável;
- [ ] ao menos FCI, FDIR, CCBS e CCL estão configuradas;
- [ ] EaD não é tratado como prédio;
- [ ] mapa atualiza painel lateral;
- [ ] filtro de turno funciona;
- [ ] filtro de semestre funciona;
- [ ] filtro de cluster funciona;
- [ ] GAD-7 aparece em quatro faixas;
- [ ] página de perfis mostra clusters;
- [ ] página de metodologia explica o método;
- [ ] nenhuma PII está no bundle público;
- [ ] grupos `n < 10` são suprimidos;
- [ ] layout funciona em celular;
- [ ] deploy público na Vercel funciona;
- [ ] README contém instruções de atualização da base.

---

# 35. ORDEM DE IMPLEMENTAÇÃO PARA O AGENTE

Executar nesta ordem.

## Fase 1 — Scaffold
1. Criar/ajustar Next.js + TypeScript + Tailwind.
2. Criar estrutura de pastas.
3. Criar layout e navegação.
4. Criar tipos.

## Fase 2 — Dados
1. Criar `scripts/build_dashboard_data.py`.
2. Criar normalização.
3. Criar agregados.
4. Criar supressão.
5. Criar fixtures de desenvolvimento sem dados reais.

## Fase 3 — UI base
1. Header.
2. FiltersBar.
3. KPIs.
4. painel de detalhes.
5. layout responsivo.

## Fase 4 — Mapa
1. Criar SVG esquemático.
2. Adicionar IDs dos prédios.
3. Configurar unidades.
4. Implementar hover/click/keyboard.
5. Implementar escala de intensidade.

## Fase 5 — Gráficos
1. GAD levels.
2. GAD score.
3. clusters.
4. comparação unidade × geral.

## Fase 6 — Perfis
1. página `/perfis`;
2. cards;
3. heatmap;
4. GAD por cluster;
5. métricas de clustering.

## Fase 7 — Metodologia
1. página `/metodologia`;
2. fontes;
3. privacidade;
4. limitações.

## Fase 8 — QA
1. testes;
2. mobile;
3. acessibilidade;
4. performance;
5. validação de PII.

## Fase 9 — Deploy
1. conectar GitHub;
2. Vercel Preview;
3. validar;
4. publicar produção.

---

# 36. PRIMEIRO RESULTADO ESPERADO DO AGENTE

Na primeira iteração, NÃO implementar tudo de uma vez.

Entregar:

1. estrutura Next.js;
2. tela principal;
3. SVG simplificado do campus;
4. quatro unidades configuradas;
5. dados MOCK tipados;
6. clique em prédio;
7. painel lateral;
8. um gráfico GAD;
9. responsividade básica.

Depois de validar visualmente, conectar o pipeline real de dados.

---

# 37. MOCK DATA

Até receber JSON real, usar dados explicitamente marcados como mock:

```ts
export const mockUnitData = {
  fci: {
    n: 100,
    suppressed: false,
    gad7: {
      mean: 10.0,
      median: 10.0,
      std: 5.0,
      levels: {
        minima: 0.2,
        leve: 0.25,
        moderada: 0.3,
        grave: 0.25,
      },
    },
  },
};
```

Adicionar banner em ambiente de desenvolvimento:

> “Dados demonstrativos — não representam os resultados do estudo.”

Nunca publicar mock como se fosse dado real.

---

# 38. COPY PRINCIPAL DA INTERFACE

Título:

> Mapa da Ansiedade

Subtítulo:

> Análise agregada de hábitos, rotinas e sintomas de ansiedade em estudantes universitários.

Descrição:

> Explore os resultados por unidade acadêmica e por perfis comportamentais identificados por técnicas de agrupamento não supervisionado.

Disclaimer:

> Este dashboard apresenta resultados acadêmicos agregados. O GAD-7 é um instrumento de rastreamento e não constitui diagnóstico clínico.

---

# 39. FONTES E REFERÊNCIAS TÉCNICAS

## Campus Mackenzie

Mapa do Campus Higienópolis:
https://www.mackenzie.br/fileadmin/ARQUIVOS/Public/top/atendimento/central-informacoes/mapa_campus_higienopolis.pdf

## Next.js
https://nextjs.org/docs

## Vercel
https://vercel.com/docs

## K-Medoids / PAM
KAUFMAN, L.; ROUSSEEUW, P. J. Finding Groups in Data: An Introduction to Cluster Analysis. Wiley, 1990.

## Silhouette
ROUSSEEUW, P. J. Silhouettes: A graphical aid to the interpretation and validation of cluster analysis. Journal of Computational and Applied Mathematics, 1987.

## Davies-Bouldin
DAVIES, D. L.; BOULDIN, D. W. A Cluster Separation Measure. IEEE TPAMI, 1979.

## Calinski-Harabasz
CALIŃSKI, T.; HARABASZ, J. A dendrite method for cluster analysis. Communications in Statistics, 1974.

## Dunn
DUNN, J. C. Well-Separated Clusters and Optimal Fuzzy Partitions. Journal of Cybernetics, 1974.

---

# 40. DEFINITION OF DONE

O agente só deve considerar a tarefa concluída quando:

- a aplicação estiver funcional;
- houver build de produção;
- o dashboard puder ser publicado na Vercel;
- o mapa for interativo;
- os dados forem agregados;
- as regras de privacidade forem automatizadas;
- o README permitir que outra pessoa atualize a base;
- nenhuma PII estiver acessível no navegador ou no repositório;
- os resultados do clustering forem consumidos do pipeline acadêmico, sem recomputação arbitrária no frontend.

---

# 41. CONTEXTO ACADÊMICO FINAL

O dashboard é um artefato complementar do TCC.

Ele não substitui o notebook e não deve alterar a metodologia.

A narrativa científica final é:

```text
Coleta
  ↓
Pré-processamento
  ↓
Análise estatística
  ↓
Aprendizado não supervisionado
  ↓
Validação dos clusters
  ↓
Caracterização dos perfis
  ↓
Comparação posterior com GAD-7
  ↓
Dashboard interativo
```

O mapa é uma camada de comunicação dos resultados agregados por unidade acadêmica, e não um mapa epidemiológico individual.

---

# 42. CHECKLIST PARA O ANTIGRAVITY ANTES DE CODIFICAR

Responda internamente antes de começar:

- [ ] Entendi que não devo usar GAD-7 para formar clusters.
- [ ] Entendi que o dashboard não possui ML supervisionado.
- [ ] Entendi que a planilha bruta é privada.
- [ ] Entendi que `n < 10` deve ser suprimido.
- [ ] Entendi que EaD não é prédio.
- [ ] Entendi que o mapa deve ser SVG próprio/esquemático.
- [ ] Entendi que clusters e nomes finais vêm do notebook.
- [ ] Entendi que os dados exibidos devem ser agregados.
- [ ] Entendi que o deploy-alvo é Vercel.
- [ ] Entendi que a primeira entrega deve usar mock data e validar UX antes de conectar dados reais.

Se algum item acima não puder ser cumprido, documente o motivo antes de alterar a arquitetura.
