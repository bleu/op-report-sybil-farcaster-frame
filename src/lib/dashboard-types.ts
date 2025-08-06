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

export type DashboardData = {
  probabilitiesSerialized: Probability[];
  reportsSerialized: Report[];
  statsSerialized: Stats[];
};

export type DashboardDataResponse = {
  success: boolean;
  data: DashboardData;
};