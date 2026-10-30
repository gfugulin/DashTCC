# Documentação do Projeto — Mapa da Ansiedade (TCC UPM)

Dashboard interativo para exploração agregada e anônima de hábitos, rotina acadêmica e sintomas de ansiedade (GAD-7) em estudantes universitários da Universidade Presbiteriana Mackenzie (Campus Higienópolis).

---

## 1. Princípios Arquiteturais e Governança de Dados

- **Proteção Integral de Privacidade (LGPD & Ética Científica):**
  - Nenhum dado pessoal identificável (PII como Nome, Email, ID ou Carimbo de Data/Hora) entra no frontend ou é versionado no Git.
  - A planilha bruta original é mantida estritamente em `data/private/` (bloqueada pelo `.gitignore`).
- **Regra de Supressão Estatística ($n < 10$):**
  - Qualquer unidade acadêmica, estrato ou combinação multidimensional de filtros com menos de 10 participantes tem suas métricas individuais detalhadas bloqueadas (`suppressed: true`), exibindo `"Amostra insuficiente para exibição"`.
- **Desacoplamento do Clustering Não Supervisionado:**
  - O GAD-7 **não participa** da formação dos clusters (K-Medoids / PAM).
  - O número de clusters ($K\text{_FINAL}$) e seus rótulos conceituais continuam sendo definidos analiticamente no notebook via índices de validação (Silhueta, Davies-Bouldin, Dunn, Calinski-Harabasz e estabilidade ARI).
  - O frontend consome apenas os dados consolidados; enquanto a seleção não for concluída, a seção de perfis opera em estado transparente `pending`.

---

## 2. Estrutura de Diretórios

```text
/
├── Docs/
│   └── ARQUITETURA_E_DADOS.md        # Esta documentação
├── AGENT_SPEC_MAPA_DA_ANSIEDADE.md   # Especificação funcional completa
├── data/
│   └── private/                      # Base bruta confidencial (.gitignore)
├── scripts/
│   └── build_dashboard_data.py       # Pipeline de higienização, GAD-7 e anonimização
├── public/
│   ├── campus/
│   │   └── mapa-oficial-higienopolis.webp # Imagem oficial do Campus Higienópolis (Mackenzie)
│   └── data/
│       ├── overview.json             # Agregados gerais e hábitos
│       ├── academic-units.json       # Agregados por unidade acadêmica
│       ├── filter-cube.json          # Cubo pré-calculado para filtros rápidos
│       └── clusters.json             # Contrato de clustering (status pending)
├── src/
│   ├── app/                          # Rotas Next.js App Router (Dashboard, Metodologia, Perfis)
│   ├── components/                   # CampusMap (Overlay SVG sobre Imagem Oficial)
│   └── types/                        # Tipagem estrita TypeScript
└── package.json
```

---

## 3. Fluxo de Atualização da Base de Dados

Sempre que uma nova versão da planilha de respostas estiver disponível:

1. **Atualizar a planilha confidencial:**
   Copie a nova planilha para `data/private/coleta.xlsx`.

2. **Executar a pipeline de anonimização e cálculo:**
   ```powershell
   py scripts/build_dashboard_data.py
   ```
   *O script valida as colunas, descarta PII, calcula o escore GAD-7 (0 a 21), aplica a supressão $n < 10$ e atualiza os arquivos em `public/data/`.*

3. **Executar o build de validação:**
   ```powershell
   npm run build
   ```

---

## 4. Execução Local

- **Modo Desenvolvimento:**
  ```powershell
  npm run dev
  ```
  Acesse: `http://localhost:3000`

- **Build de Produção:**
  ```powershell
  npm run build
  npm run start
  ```

---

## 5. Mapeamento Espacial e Unidades Acadêmicas do Campus Higienópolis

O mapa interativo utiliza a imagem oficial de alta definição do Campus Higienópolis (`/campus/mapa-oficial-higienopolis.webp`, 2480x1526) com overlay vetorial SVG responsivo, contendo coordenadas calibradas com base nos prédios oficiais:

| Unidade Acadêmica | Sigla | Prédios Mapeados | Amostra Real ($n$) | Status Analítico | GAD-7 Médio |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Faculdade de Computação e Informática** | FCI | **31** | 171 | **Ativa** ($n \ge 10$) | 10.02 |
| **Centro de Ciências Biológicas e da Saúde** | CCBS | **38 e 50** | 11 | **Ativa** ($n \ge 10$) | 9.18 |
| **Faculdade de Direito** | FDIR | **3 e 24** | 7 | **Suprimida** ($n < 10$) | — |
| **Centro de Comunicação e Letras** | CCL | **48 e 49** | 2 | **Suprimida** ($n < 10$) | — |
| **Escola de Engenharia** | EE | **6 e 16** | 1 | **Suprimida** ($n < 10$) | — |

### Comportamento do Mapa e Supressão Ética (LGPD)
- **Navegação com Pan & Zoom:** O usuário pode aproximar (até 350%), afastar, arrastar e usar os botões de foco institucional (FCI, CCBS, FDIR, CCL, EE e Visão Geral).
- **Seleção Sincronizada:** Ao selecionar uma unidade (pelo clique no polígono do prédio no mapa ou na barra de atalhos rápidos), todo o dashboard atualiza o contexto.
- **Unidades Ativas ($n \ge 10$):** Exibem KPIs completos, escore médio, mediana, boxplot de dispersão, distribuição clínica em barras empilhadas 100% e cruzamentos de hábitos de vida.
- **Unidades Suprimidas ($n < 10$):** O polígono adquire preenchimento neutro e o painel exibe a justificativa ética formal de proteção à privacidade do participante.

---

## 6. Identidade Visual Institucional

As marcas oficiais da **Universidade Presbiteriana Mackenzie** e da **Faculdade de Computação e Informática (FCI)** foram extraídas diretamente dos manuais institucionais (`Docs/Identidade visual/`) e calibradas sem margens vazias transparentes (bounding box aparado sem perdas), garantindo:
- Diâmetro óptico idêntico para o símbolo circular do Mackenzie `(M)` em ambas as assinaturas.
- Aplicação no cabeçalho institucional (`/brand/mackenzie-logo.png` e `/brand/fci-logo.png`) e no rodapé formal do TCC.

---

## 7. Integração Consolidada do $K\text{_FINAL} = 3$ de Clusters (K-Medoids / PAM)

A análise não supervisionada foi extraída e validada a partir do notebook analítico `tcc_mapa_ansiedade.ipynb`:
- **Algoritmo:** K-Medoids (PAM) com distância Euclidiana e padronização por Z-Score sobre 6 dimensões comportamentais (Horas de sono, Qualidade do sono, Atividade física, Alimentação adequada, Carga horária de estudo e Tempo de lazer).
- **Não-contaminação:** A escala GAD-7 não participou do clustering.
- **Métricas de Validação Estatística ($K=3$):**
  - Inércia: 375.5002
  - Silhueta: 0.1405
  - Davies-Bouldin: 2.0166
  - Calinski-Harabasz: 36.1399
  - Índice de Dunn: 0.1657
- **Perfis Formados:**
  1. *Perfil 1 — Sono reduzido e hábitos intermediários* ($n=79$, 42.5%, GAD-7 médio: 10.23, mod+grave: 53.2%)
  2. *Perfil 2 — Maior duração de sono e maior tempo de descanso* ($n=65$, 35.0%, GAD-7 médio: 8.48, mod+grave: 47.7%)
  3. *Perfil 3 — Hábitos menos favoráveis e menor tempo de descanso* ($n=42$, 22.6%, GAD-7 médio: 13.17, mod+grave: 71.4%)
- **Disponibilização:** Estruturado e servido via `public/data/clusters.json` com `status: "ready"`, renderizado em tempo real na rota `/perfis`.

---

## 8. Procedimento de Deploy na Vercel

O projeto foi arquitetado como uma aplicação Next.js estaticamente pré-renderizada (SSG), não exigindo servidor Node.js permanente em produção:

1. **Inicialização do repositório Git local:**
   ```powershell
   git init
   git add .
   git commit -m "feat: conclusao do dashboard do mapa da ansiedade TCC"
   ```
2. **Subida para o GitHub (Repositório Privado):**
   * Crie um repositório no GitHub.
   * Certifique-se de que o `.gitignore` está ativo (garantindo que `data/private/coleta.xlsx` nunca seja versionado).
3. **Deploy na Vercel:**
   * Conecte o repositório na dashboard da Vercel.
   * O framework `Next.js` será identificado automaticamente com comando de build `next build`.
   * Todas as páginas e dados JSON em `public/data/` são servidos globalmente via CDN edge.
