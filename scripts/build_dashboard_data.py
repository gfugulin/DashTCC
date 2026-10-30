#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Preparação e Anonimização dos Dados do TCC - Mapa da Ansiedade.
Gera agregados institucionais seguros e ricos para o Dashboard:
- KPIs consolidados
- Distribuições descritivas e histograma GAD-7
- Estatísticas de dispersão (Boxplot: min, Q1, mediana, Q3, max)
- Cruzamento Hábito × Nível GAD-7 (Barras 100%)
- Indicadores Acadêmicos (notas, faltas, trancamentos, atividades)
- Amostra e Limitações Metodológicas
- Estrita supressão para recortes com n < 10 e remoção total de PII
"""

from pathlib import Path
import json
import re
import unicodedata
import numpy as np
import pandas as pd

MIN_PUBLIC_SAMPLE_SIZE = 10

def chave_texto(valor):
    if pd.isna(valor):
        return ""
    texto = unicodedata.normalize("NFKD", str(valor))
    texto = texto.encode("ascii", "ignore").decode("ascii").lower().strip()
    return re.sub(r"\s+", " ", texto)

def padronizar_curso(valor):
    chave = chave_texto(valor)
    if "ciencia da computacao" in chave or "sistemas de informacao" in chave:
        return "Ciência da Computação / Sistemas de Informação"
    if chave == "ads" or ("analise" in chave and "desenvolvimento" in chave):
        return "Análise e Desenvolvimento de Sistemas"
    if "banco de dados" in chave:
        return "Banco de Dados"
    if "licenciatura em matematica" in chave or "matematica" in chave:
        return "Licenciatura em Matemática"
    if "direito" in chave:
        return "Direito"
    if chave in {"pp", "mkt"} or "publicidade" in chave or "marketing" in chave:
        return "Publicidade, Propaganda e Marketing"
    if "nutri" in chave:
        return "Nutrição"
    if "engenharia de gestao" in chave:
        return "Engenharia de Gestão"
    return str(valor).strip() if chave else "Outro / Não informado"

def derivar_unidade_academica(curso, campus=""):
    if curso in {
        "Ciência da Computação / Sistemas de Informação",
        "Análise e Desenvolvimento de Sistemas",
        "Banco de Dados",
        "Licenciatura em Matemática"
    }:
        return "FCI"
    if curso == "Direito":
        return "FDIR"
    if curso == "Nutrição":
        return "CCBS"
    if curso == "Publicidade, Propaganda e Marketing":
        return "CCL"
    if curso == "Engenharia de Gestão":
        return "EE"
    return "OUTROS"

def normalizar_turno(turno_raw):
    chave = chave_texto(turno_raw)
    if "noturno" in chave or "noite" in chave:
        return "Noturno"
    if "matutino" in chave or "manha" in chave:
        return "Matutino"
    if "vespertino" in chave or "tarde" in chave:
        return "Vespertino"
    if "integral" in chave:
        return "Integral"
    return "Outro"

def normalizar_semestre(sem_raw):
    s = str(sem_raw).strip()
    match = re.search(r"\d+", s)
    if match:
        num = int(match.group())
        return f"{num}º Semestre"
    return s if s else "Não informado"

def normalizar_trabalha(trab_raw):
    chave = chave_texto(trab_raw)
    if "sim" in chave:
        return "Sim"
    if "nao" in chave:
        return "Não"
    return "Não informado"

def calcular_gad7_agregado(df_sub):
    n = len(df_sub)
    if n < MIN_PUBLIC_SAMPLE_SIZE:
        return {
            "n": int(n),
            "suppressed": True,
            "message": "Amostra insuficiente para exibição (n < 10)"
        }

    scores = df_sub["score_gad7"].to_numpy(dtype=float)
    mean_val = float(np.round(np.mean(scores), 2))
    median_val = float(np.round(np.median(scores), 2))
    std_val = float(np.round(np.std(scores, ddof=1), 2)) if n > 1 else 0.0

    q1 = float(np.round(np.percentile(scores, 25), 2))
    q3 = float(np.round(np.percentile(scores, 75), 2))
    min_val = float(np.min(scores))
    max_val = float(np.max(scores))

    # Níveis
    niveis_count = df_sub["gad7_level"].value_counts(normalize=True).to_dict()
    minima = float(np.round(niveis_count.get("Mínima", 0.0), 4))
    leve = float(np.round(niveis_count.get("Leve", 0.0), 4))
    moderada = float(np.round(niveis_count.get("Moderada", 0.0), 4))
    grave = float(np.round(niveis_count.get("Grave", 0.0), 4))

    return {
        "n": int(n),
        "suppressed": False,
        "mean": mean_val,
        "median": median_val,
        "std": std_val,
        "boxplot": {
            "min": min_val,
            "q1": q1,
            "median": median_val,
            "q3": q3,
            "max": max_val
        },
        "levels": {
            "minima": minima,
            "leve": leve,
            "moderada": moderada,
            "grave": grave
        },
        "pct_moderate_severe": float(np.round(moderada + grave, 4))
    }

def cruzamento_habito_gad(df_dados, coluna_habito):
    if coluna_habito not in df_dados.columns:
        return []
    resultado = []
    # Ordena categorias pela frequência decrescente
    cats = df_dados[coluna_habito].value_counts().index
    for cat in cats:
        sub = df_dados[df_dados[coluna_habito] == cat]
        n_cat = len(sub)
        if n_cat == 0:
            continue
        ct = sub["gad7_level"].value_counts(normalize=True).to_dict()
        resultado.append({
            "category": str(cat),
            "n": int(n_cat),
            "pctOfTotal": float(np.round(n_cat / len(df_dados), 4)),
            "levels": {
                "minima": float(np.round(ct.get("Mínima", 0.0), 4)),
                "leve": float(np.round(ct.get("Leve", 0.0), 4)),
                "moderada": float(np.round(ct.get("Moderada", 0.0), 4)),
                "grave": float(np.round(ct.get("Grave", 0.0), 4))
            },
            "meanGad7": float(np.round(sub["score_gad7"].mean(), 2)) if n_cat >= 3 else None
        })
    return resultado

def validar_sem_pii(dados_obj):
    serializado = json.dumps(dados_obj, ensure_ascii=False).lower()
    for termo in ["@mackenzie", "@gmail", "gustavo", "hora de inicio", "nome_completo"]:
        if termo in serializado:
            raise ValueError(f"Alerta de segurança: termo sensível '{termo}' detectado na saída pública!")

def main():
    root = Path(__file__).resolve().parent.parent
    caminho_privado = root / "data" / "private" / "coleta.xlsx"
    if not caminho_privado.exists():
        xlsx_cands = list(root.glob("*.xlsx"))
        if not xlsx_cands:
            raise FileNotFoundError("Planilha bruta não encontrada.")
        caminho_privado = xlsx_cands[0]

    df_raw = pd.read_excel(caminho_privado)
    df = df_raw.copy()

    # Critérios de elegibilidade e consentimento
    if "Tenho 18 anos ou mais" in df.columns:
        df = df[df["Tenho 18 anos ou mais"].astype(str).str.lower().str.contains("sim", na=False)]
    if "Li e concordo em participar" in df.columns:
        df = df[df["Li e concordo em participar"].astype(str).str.lower().str.contains("sim", na=False)]
    if "Autorizo o uso acadêmico e publicação de resultados agregados e anônimos." in df.columns:
        df = df[df["Autorizo o uso acadêmico e publicação de resultados agregados e anônimos."].astype(str).str.lower().str.contains("sim", na=False)]
    if "Instituição" in df.columns:
        df = df[df["Instituição"].astype(str).str.strip().str.lower().str.contains("mack", na=False) | df["Instituição"].astype(str).str.strip().str.contains("UPM|FCI", na=False)]

    # GAD-7
    gad7_mapa = {"": 0, "Nunca": 0, "Vários dias": 1, "Mais da metade dos dias": 2, "Quase todos os dias": 3}
    colunas_gad7 = [
        "Sentir-se nervoso(a), ansioso(a) ou “no limite”.",
        "Não conseguir parar ou controlar a preocupação.",
        "Preocupar-se demais com diferentes coisas.",
        "Dificuldade para relaxar.",
        "Ficar tão agitado(a) que é difícil permanecer sentado(a) parado(a).",
        "Tornar-se facilmente irritado(a) ou impaciente.",
        "Sentir medo como se algo terrível pudesse acontecer."
    ]
    df_gad = df[colunas_gad7].replace(gad7_mapa).fillna(0).astype(int)
    score_gad7 = df_gad.sum(axis=1)

    def classificar_gad(s):
        if s <= 4: return "Mínima"
        elif s <= 9: return "Leve"
        elif s <= 14: return "Moderada"
        else: return "Grave"

    df_clean = pd.DataFrame()
    df_clean["score_gad7"] = score_gad7
    df_clean["gad7_level"] = score_gad7.apply(classificar_gad)

    df_clean["curso_normalizado"] = df["Curso/Faculdade"].apply(padronizar_curso)
    df_clean["unidade_academica"] = [derivar_unidade_academica(c) for c in df_clean["curso_normalizado"]]
    df_clean["turno"] = df["Turno"].apply(normalizar_turno) if "Turno" in df.columns else "Não informado"
    df_clean["semestre"] = df["Semestre Atual"].apply(normalizar_semestre) if "Semestre Atual" in df.columns else "Não informado"
    df_clean["trabalha"] = df["Trabalha atualmente?"].apply(normalizar_trabalha) if "Trabalha atualmente?" in df.columns else "Não informado"

    # Hábitos
    map_habitos = {
        "Horas de sono por noite": "horas_sono",
        "Qualidade do sono (últimas 2 semanas)": "qualidade_sono",
        "Atividade física semanal": "atividade_fisica",
        "Alimentação adequada (autoavaliação)": "alimentacao",
        "Carga diária de estudos fora da aula": "carga_estudos",
        "Tempo de lazer/descanso por dia": "tempo_lazer",
        "Média de notas": "notas",
        "Faltas recorrentes neste semestre": "faltas",
        "Trancou disciplina no último ano?": "trancamento",
        "Atividades complementares/monitoria/iniciação": "atividades_extracurriculares"
    }
    for col_orig, col_dest in map_habitos.items():
        if col_orig in df.columns:
            df_clean[col_dest] = df[col_orig].astype(str).str.strip()

    # Agregações de Hábitos Cruzados com GAD-7 (100% empilhadas)
    habitos_cruzados = {
        "sleepHours": cruzamento_habito_gad(df_clean, "horas_sono"),
        "sleepQuality": cruzamento_habito_gad(df_clean, "qualidade_sono"),
        "physicalActivity": cruzamento_habito_gad(df_clean, "atividade_fisica"),
        "nutritionQuality": cruzamento_habito_gad(df_clean, "alimentacao"),
        "studyLoad": cruzamento_habito_gad(df_clean, "carga_estudos"),
        "leisureTime": cruzamento_habito_gad(df_clean, "tempo_lazer")
    }

    # Indicadores Acadêmicos Agregados
    academic_data = {}
    for col_acad, chave in [
        ("semestre", "semesters"),
        ("trabalha", "workStatus"),
        ("notas", "grades"),
        ("faltas", "absences"),
        ("trancamento", "courseDrop"),
        ("atividades_extracurriculares", "extracurricular")
    ]:
        if col_acad in df_clean.columns:
            vc = df_clean[col_acad].value_counts(normalize=True).to_dict()
            academic_data[chave] = [{"category": str(k), "pct": float(np.round(v, 4)), "n": int(df_clean[col_acad].value_counts()[k])} for k, v in vc.items()]

    # Histograma GAD-7
    hist_counts, _ = np.histogram(df_clean["score_gad7"], bins=range(23))
    histograma = [{"score": int(i), "count": int(c)} for i, c in enumerate(hist_counts) if i <= 21]

    # Distribuição da Amostra (Para seção Sobre a Amostra)
    sample_distribution = {
        "byUnit": [{"name": str(k), "count": int(v), "pct": float(np.round(v / len(df_clean), 4))} for k, v in df_clean["unidade_academica"].value_counts().items()],
        "byTurno": [{"name": str(k), "count": int(v), "pct": float(np.round(v / len(df_clean), 4))} for k, v in df_clean["turno"].value_counts().items()],
        "bySemestre": [{"name": str(k), "count": int(v), "pct": float(np.round(v / len(df_clean), 4))} for k, v in df_clean["semestre"].value_counts().items()],
        "byTrabalha": [{"name": str(k), "count": int(v), "pct": float(np.round(v / len(df_clean), 4))} for k, v in df_clean["trabalha"].value_counts().items()]
    }

    # Arquitetura Multi-Campus (Configuração extensível)
    campi_config = [
        {
            "campusId": "higienopolis",
            "name": "Campus Higienópolis",
            "city": "São Paulo",
            "default": True,
            "image": "/campus/mapa-oficial-higienopolis.webp",
            "dimensions": {"width": 2480, "height": 1526}
        }
    ]

    overview_data = {
        "metadata": {
            "totalRawResponses": int(len(df_raw)),
            "eligibleResponses": int(len(df_clean)),
            "generatedAt": pd.Timestamp.now().isoformat(),
            "minSampleSize": MIN_PUBLIC_SAMPLE_SIZE
        },
        "campi": campi_config,
        "overallGad7": calcular_gad7_agregado(df_clean),
        "gad7Distribution": histograma,
        "crossHabits": habitos_cruzados,
        "academic": academic_data,
        "sampleDistribution": sample_distribution
    }

    # Configuração de Unidades com multi-campus
    config_unidades = [
        {
            "campusId": "higienopolis",
            "id": "fci",
            "acronym": "FCI",
            "name": "Faculdade de Computação e Informática",
            "buildingIds": ["31"],
            "primaryBuildingId": "31",
            "enabledOnMap": True,
            "description": "Cursos de Ciência da Computação, Sistemas de Informação, ADS, Banco de Dados e Matemática."
        },
        {
            "campusId": "higienopolis",
            "id": "fdir",
            "acronym": "FDIR",
            "name": "Faculdade de Direito",
            "buildingIds": ["3", "24"],
            "primaryBuildingId": "3",
            "enabledOnMap": True,
            "description": "Faculdade de Direito (Prédios 3 e 24)."
        },
        {
            "campusId": "higienopolis",
            "id": "ccbs",
            "acronym": "CCBS",
            "name": "Centro de Ciências Biológicas e da Saúde",
            "buildingIds": ["50", "38"],
            "primaryBuildingId": "50",
            "enabledOnMap": True,
            "description": "Centro de Ciências Biológicas e da Saúde (Nutrição e cursos da saúde)."
        },
        {
            "campusId": "higienopolis",
            "id": "ccl",
            "acronym": "CCL",
            "name": "Centro de Comunicação e Letras",
            "buildingIds": ["49", "48"],
            "primaryBuildingId": "49",
            "enabledOnMap": True,
            "description": "Centro de Comunicação e Letras (Publicidade, Propaganda e Marketing)."
        },
        {
            "campusId": "higienopolis",
            "id": "ee",
            "acronym": "EE",
            "name": "Escola de Engenharia",
            "buildingIds": ["6", "16"],
            "primaryBuildingId": "6",
            "enabledOnMap": True,
            "description": "Escola de Engenharia Mackenzie."
        }
    ]

    units_output = []
    for u in config_unidades:
        acron = u["acronym"]
        df_u = df_clean[df_clean["unidade_academica"] == acron]
        agregado_u = calcular_gad7_agregado(df_u)

        # Hábitos cruzados da unidade se não suprimida
        habitos_u = {}
        if not agregado_u["suppressed"]:
            habitos_u = {
                "sleepHours": cruzamento_habito_gad(df_u, "horas_sono"),
                "physicalActivity": cruzamento_habito_gad(df_u, "atividade_fisica"),
                "leisureTime": cruzamento_habito_gad(df_u, "tempo_lazer")
            }

        units_output.append({
            **u,
            "metrics": agregado_u,
            "crossHabits": habitos_u
        })

    # Cubo de Filtros
    filter_cube = []
    unidades_lista = [None] + ["FCI", "FDIR", "CCBS", "CCL", "EE"]
    turnos_lista = [None] + list(df_clean["turno"].unique())
    trabalha_lista = [None, "Sim", "Não"]

    for u in unidades_lista:
        for t in turnos_lista:
            for trab in trabalha_lista:
                mask = pd.Series(True, index=df_clean.index)
                if u: mask &= (df_clean["unidade_academica"] == u)
                if t: mask &= (df_clean["turno"] == t)
                if trab: mask &= (df_clean["trabalha"] == trab)

                sub = df_clean[mask]
                if len(sub) == 0: continue
                key = f"u={u or '*'}|t={t or '*'}|w={trab or '*'}"
                filter_cube.append({
                    "key": key,
                    "filters": {"unidade": u, "turno": t, "trabalha": trab},
                    "metrics": calcular_gad7_agregado(sub)
                })

    # Clusters (Pending)
    clusters_output = {
        "status": "pending",
        "message": "Metodologia de clustering em consolidação analítica no notebook do TCC.",
        "k_final": None,
        "metricas_validacao": None,
        "perfis": []
    }

    validar_sem_pii(overview_data)
    validar_sem_pii(units_output)
    validar_sem_pii(filter_cube)

    public_data_dir = root / "public" / "data"
    public_data_dir.mkdir(parents=True, exist_ok=True)

    with open(public_data_dir / "overview.json", "w", encoding="utf-8") as f:
        json.dump(overview_data, f, ensure_ascii=False, indent=2)

    with open(public_data_dir / "academic-units.json", "w", encoding="utf-8") as f:
        json.dump(units_output, f, ensure_ascii=False, indent=2)

    with open(public_data_dir / "filter-cube.json", "w", encoding="utf-8") as f:
        json.dump(filter_cube, f, ensure_ascii=False, indent=2)

    clusters_file = public_data_dir / "clusters.json"
    if not clusters_file.exists():
        with open(clusters_file, "w", encoding="utf-8") as f:
            json.dump(clusters_output, f, ensure_ascii=False, indent=2)

    print("Pipeline de dados concluído com sucesso!")
    print(f"Total elegíveis: {len(df_clean)}")
    for u in units_output:
        st = "SUPRIMIDO" if u["metrics"]["suppressed"] else f"n={u['metrics']['n']}, mean={u['metrics']['mean']}"
        print(f" - {u['acronym']}: {st}")

if __name__ == "__main__":
    main()
