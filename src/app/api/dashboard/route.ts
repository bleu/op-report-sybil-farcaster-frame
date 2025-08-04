import { prisma } from "~/lib/prisma";
import { createApiResponse, withErrorHandling } from "~/utils/api-helpers";

const getProbabilities = async () => {
  const probabilities = await prisma.$queryRaw`
    WITH intervals AS (
      SELECT 
        (LEAST(WIDTH_BUCKET(sybil_probability, 0, 1, 20), 20) - 1) * 0.05 AS start_interval,
        LEAST(WIDTH_BUCKET(sybil_probability, 0, 1, 20), 20) * 0.05 AS end_interval,
        COUNT(*) AS count
      FROM sybil_probabilities
      WHERE sybil_probability IS NOT NULL
      GROUP BY LEAST(WIDTH_BUCKET(sybil_probability, 0, 1, 20), 20)
    )
    SELECT 
      start_interval,
      end_interval,
      count
    FROM intervals
    ORDER BY start_interval;
  ` as any[];

  // Transform bigint values to numbers
  return probabilities.map(row => ({
    ...row,
    count: Number(row.count) // Convert bigint to number
  }));
};

const getReports = async () => {
  const reports = await prisma.$queryRaw`
    WITH date_series AS (
        SELECT 
            CURRENT_DATE - INTERVAL '90 days' + INTERVAL '1 day' * generate_series(0, 89) AS date
    ),
    daily_reports AS (
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as report_count
        FROM reports
        WHERE DATE(created_at) >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY DATE(created_at)
    )
    SELECT 
        ds.date,
        COALESCE(dr.report_count, 0) as report_count
    FROM date_series ds
    LEFT JOIN daily_reports dr ON ds.date = dr.date
    ORDER BY ds.date;
  ` as any[];

  return reports.map(row => ({
    ...row,
    report_count: Number(row.report_count) // Convert bigint to number
  }));
};

const getStats = async () => {
  const stats = await prisma.$queryRaw`
    WITH reports_count AS (
        SELECT
            target_fid,
            SUM(CASE WHEN reported_as_sybil = true THEN 1 ELSE 0 END) as sybil_reports,
            SUM(CASE WHEN reported_as_sybil = false THEN 1 ELSE 0 END) as human_reports
        FROM reports
        GROUP BY target_fid
    ),
    basic_counts AS (
        SELECT
            SUM(CASE WHEN sybil_diagnosis = true THEN 1 ELSE 0 END) as detected_sybils,
            SUM(CASE WHEN sybil_diagnosis = false THEN 1 ELSE 0 END) as detected_benigns,
            SUM(CASE WHEN sybil_diagnosis IS NULL THEN 1 ELSE 0 END) as detected_unknowns
        FROM sybil_probabilities
    ),
    diagnosed_sybils_analysis AS (
        SELECT
            SUM(CASE 
                WHEN (rc.target_fid IS NULL OR rc.sybil_reports >= rc.human_reports) THEN 1 
                ELSE 0 
            END) as true_detected_sybils,
            SUM(CASE 
                WHEN (rc.target_fid IS NOT NULL AND rc.sybil_reports < rc.human_reports) THEN 1 
                ELSE 0 
            END) as false_detected_sybils
        FROM sybil_probabilities sp
        LEFT JOIN reports_count rc ON sp.fid = rc.target_fid
        WHERE sp.sybil_diagnosis = true
    ),
    diagnosed_benigns_analysis AS (
        SELECT
            SUM(CASE 
                WHEN (rc.target_fid IS NULL OR rc.sybil_reports <= rc.human_reports) THEN 1 
                ELSE 0 
            END) as true_detected_benigns,
            SUM(CASE 
                WHEN (rc.target_fid IS NOT NULL AND rc.sybil_reports > rc.human_reports) THEN 1 
                ELSE 0 
            END) as false_detected_benigns
        FROM sybil_probabilities sp
        LEFT JOIN reports_count rc ON sp.fid = rc.target_fid
        WHERE sp.sybil_diagnosis = false
    ),
    unknowns_analysis AS (
        SELECT
            SUM(CASE 
                WHEN (rc.target_fid IS NOT NULL AND rc.sybil_reports > rc.human_reports) THEN 1 
                ELSE 0 
            END) as sybils_detected_unknowns,
            SUM(CASE 
                WHEN (rc.target_fid IS NOT NULL AND rc.sybil_reports < rc.human_reports) THEN 1 
                ELSE 0 
            END) as benigns_detected_unknowns,
            SUM(CASE 
                WHEN (rc.target_fid IS NULL OR rc.sybil_reports = rc.human_reports) THEN 1 
                ELSE 0 
            END) as true_unknowns
        FROM sybil_probabilities sp
        LEFT JOIN reports_count rc ON sp.fid = rc.target_fid
        WHERE sp.sybil_diagnosis IS NULL
    )
    SELECT 'detected_sybils' as metric, COALESCE(bc.detected_sybils, 0) as value
    FROM basic_counts bc
    UNION ALL
    SELECT 'detected_benigns' as metric, COALESCE(bc.detected_benigns, 0) as value
    FROM basic_counts bc
    UNION ALL
    SELECT 'detected_unknowns' as metric, COALESCE(bc.detected_unknowns, 0) as value
    FROM basic_counts bc
    UNION ALL
    SELECT 'true_detected_sybils' as metric, COALESCE(dsa.true_detected_sybils, 0) as value
    FROM diagnosed_sybils_analysis dsa
    UNION ALL
    SELECT 'false_detected_sybils' as metric, COALESCE(dsa.false_detected_sybils, 0) as value
    FROM diagnosed_sybils_analysis dsa
    UNION ALL
    SELECT 'true_detected_benigns' as metric, COALESCE(dba.true_detected_benigns, 0) as value
    FROM diagnosed_benigns_analysis dba
    UNION ALL
    SELECT 'false_detected_benigns' as metric, COALESCE(dba.false_detected_benigns, 0) as value
    FROM diagnosed_benigns_analysis dba
    UNION ALL
    SELECT 'sybils_detected_unknowns' as metric, COALESCE(ua.sybils_detected_unknowns, 0) as value
    FROM unknowns_analysis ua
    UNION ALL
    SELECT 'benigns_detected_unknowns' as metric, COALESCE(ua.benigns_detected_unknowns, 0) as value
    FROM unknowns_analysis ua
    UNION ALL
    SELECT 'true_unknowns' as metric, COALESCE(ua.true_unknowns, 0) as value
    FROM unknowns_analysis ua
    UNION ALL
    SELECT 'total_reports' as metric, COALESCE(COUNT(*), 0) as value from reports
  ` as any[];

  return stats.map(row => ({
    ...row,
    value: Number(row.value) // Convert bigint to number
  }));
};

const getData = async (): Promise<Response> => {
  const [probabilitiesSerialized, reportsSerialized, statsSerialized] = await Promise.all([
    getProbabilities(),
    getReports(),
    getStats()
  ]);

  return Response.json(createApiResponse({
    probabilitiesSerialized, 
    reportsSerialized, 
    statsSerialized
  }));
};

export const GET = withErrorHandling(getData)