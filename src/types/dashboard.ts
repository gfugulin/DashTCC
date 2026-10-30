export type GadLevel = "minima" | "leve" | "moderada" | "grave";

export type BoxplotStats = {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
};

export type GadAggregate = {
  n: number;
  suppressed: boolean;
  message?: string;
  mean?: number;
  median?: number;
  std?: number;
  boxplot?: BoxplotStats;
  levels?: {
    minima: number;
    leve: number;
    moderada: number;
    grave: number;
  };
  pct_moderate_severe?: number;
};

export type CrossHabitItem = {
  category: string;
  n: number;
  pctOfTotal: number;
  levels: {
    minima: number;
    leve: number;
    moderada: number;
    grave: number;
  };
  meanGad7: number | null;
};

export type AcademicCategoryItem = {
  category: string;
  pct: number;
  n: number;
};

export type CampusConfig = {
  campusId: string;
  name: string;
  city: string;
  default: boolean;
  image: string;
  dimensions: { width: number; height: number };
};

export type AcademicUnit = {
  campusId: string;
  id: string;
  acronym: string;
  name: string;
  buildingIds: string[];
  primaryBuildingId?: string;
  enabledOnMap: boolean;
  description: string;
  metrics: GadAggregate;
  crossHabits?: {
    sleepHours?: CrossHabitItem[];
    physicalActivity?: CrossHabitItem[];
    leisureTime?: CrossHabitItem[];
  };
};

export type OverviewData = {
  metadata: {
    totalRawResponses: number;
    eligibleResponses: number;
    generatedAt: string;
    minSampleSize: number;
  };
  campi: CampusConfig[];
  overallGad7: GadAggregate;
  gad7Distribution: Array<{ score: number; count: number }>;
  crossHabits: {
    sleepHours?: CrossHabitItem[];
    sleepQuality?: CrossHabitItem[];
    physicalActivity?: CrossHabitItem[];
    nutritionQuality?: CrossHabitItem[];
    studyLoad?: CrossHabitItem[];
    leisureTime?: CrossHabitItem[];
  };
  academic: {
    semesters?: AcademicCategoryItem[];
    workStatus?: AcademicCategoryItem[];
    grades?: AcademicCategoryItem[];
    absences?: AcademicCategoryItem[];
    courseDrop?: AcademicCategoryItem[];
    extracurricular?: AcademicCategoryItem[];
  };
  sampleDistribution: {
    byUnit: Array<{ name: string; count: number; pct: number }>;
    byTurno: Array<{ name: string; count: number; pct: number }>;
    bySemestre: Array<{ name: string; count: number; pct: number }>;
    byTrabalha: Array<{ name: string; count: number; pct: number }>;
  };
};

export type FilterCubeItem = {
  key: string;
  filters: {
    unidade: string | null;
    turno: string | null;
    trabalha: string | null;
  };
  metrics: GadAggregate;
};

export type ClusterValidationMetrics = {
  k: number;
  inertia: number;
  silhouette: number;
  daviesBouldin: number;
  calinskiHarabasz: number;
  dunnIndex: number;
};

export type ClusterProfile = {
  id: number;
  name: string;
  n: number;
  pct: number;
  color: string;
  description: string;
  gad7: {
    mean: number;
    median: number;
    std: number;
    levels: {
      minima: number;
      leve: number;
      moderada: number;
      grave: number;
    };
    pctModerateSevere: number;
  };
  habitsSummary: {
    sleep: string;
    physicalActivity: string;
    nutrition: string;
    leisure: string;
    studyLoad: string;
  };
  zScores?: {
    sleepHours: number;
    sleepQuality: number;
    physicalActivity: number;
    nutrition: number;
    studyLoad: number;
    leisure: number;
  };
};

export type ClustersData = {
  status: "pending" | "ready";
  message: string;
  k_final?: number | null;
  metricas_validacao?: ClusterValidationMetrics | null;
  perfis?: ClusterProfile[];
};
