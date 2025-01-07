import { CreateReportParamsQuery } from "~/app/api/create-report/route";
import { useCreateReport } from "./useCreateReport";
import { ReportParams, useRequestAttestation } from "./useRequestAttestation";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";

export function useReportSybil({
  chainId,
  attester,
  sybilProbability,
}: {
  chainId: number;
  attester: string | undefined;
  sybilProbability: number | undefined;
}) {
  const [report, setReport] = useState<CreateReportParamsQuery | undefined>(
    undefined
  );
  const [reportParamsState, setReportParamsState] = useState<
    ReportParams | undefined
  >(undefined);

  const account = useAccount();

  const {
    requestAttestation,
    attestationData,
    error: attestationError,
    isPending: isAttestationPending,
    isVerified: isAttestationVerified,
  } = useRequestAttestation({ chainId, attester });

  const {
    data: success,
    isLoading: isCreatingReport,
    error: createReportError,
  } = useCreateReport(report);

  useEffect(() => {
    if (attestationData && reportParamsState && !success) {
      setReport({
        reporterFid: reportParamsState.reporterFid.toString(),
        targetFid: reportParamsState.targetFid.toString(),
        reportedAsSybil: reportParamsState.reportedAsSybil,
        network: null,
        messageHash: null,
        castHash: null,
        sybilProbability:
          sybilProbability !== undefined ? sybilProbability : null,
        attestation:
          isAttestationVerified && attestationData
            ? JSON.stringify(
                {
                  attestation: attestationData,
                  attester: account.address,
                },
                (key, value) =>
                  typeof value === "bigint" ? value.toString() + "n" : value
              )
            : undefined,
      });
    }
  }, [
    attestationData,
    reportParamsState,
    chainId,
    sybilProbability,
    isAttestationVerified,
    success,
  ]);

  const reportSybil = useCallback(
    (params: ReportParams) => {
      setReportParamsState(params);
      requestAttestation(params);
    },
    [requestAttestation]
  );

  const isLoading = isCreatingReport || isAttestationPending;

  return {
    reportSybil,
    success,
    isLoading,
    attestationError,
    createReportError,
  };
}
