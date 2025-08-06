export type Probability = {
  start_interval: string;
  end_interval: string;
  count: number;
};

export type Report = {
  date: string;
  report_count: number;
};

export type Stats = {
  metric: string;
  value: number;
};

export type StatsFormatted = {
  detected_sybils: number;
  detected_benigns: number;
  detected_unknowns: number;
  true_detected_sybils: number;
  false_detected_sybils: number;
  true_detected_benigns: number;
  false_detected_benigns: number;
  sybils_detected_unknowns: number;
  benigns_detected_unknowns: number;
  true_unknowns: number;
  total_reports: number;
}

export type DashboardData = {
  probabilitiesSerialized: Probability[];
  reportsSerialized: Report[];
  statsSerialized: Stats[];
};

export type DashboardDataResponse = {
  success: boolean;
  data: DashboardData;
};