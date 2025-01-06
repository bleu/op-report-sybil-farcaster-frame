"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import sdk, { type FrameContext } from "@farcaster/frame-sdk";
import { useAccount, useDisconnect, useConnect, useChainId } from "wagmi";

import { config } from "~/components/providers/WagmiProvider";
import { Button } from "~/components/ui/Button";
import { useReportSybil } from "~/hooks/useReportSybil";
import { useUserData } from "~/hooks/useUserData";

import ReCAPTCHA from "react-google-recaptcha";

export default function Frontend(
  { title }: { title?: string } = { title: "Check Sybil" }
) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();

  const [added, setAdded] = useState(false);

  const [addFrameResult, setAddFrameResult] = useState("");

  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const {
    data: targetData,
    error: targetError,
    isLoading: targetIsLoading,
  } = useUserData(807252);

  const { success, reportSybil, attestationError, createReportError } =
    useReportSybil({
      chainId,
      attester: address,
      sybilProbability: targetData?.sybilProbability,
    });

  const { disconnect } = useDisconnect();
  const { connect } = useConnect();

  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);
      setAdded(context.client.added);

      sdk.on("frameAdded", ({ notificationDetails }) => {
        setAdded(true);
      });

      sdk.on("frameRemoved", () => {
        setAdded(false);
      });

      sdk.on("primaryButtonClicked", () => {
        console.log("primaryButtonClicked");
      });

      sdk.actions.ready({});
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded]);

  const addFrame = useCallback(async () => {
    try {
      const result = await sdk.actions.addFrame();

      if (result.added) {
        setAddFrameResult(
          result.notificationDetails
            ? `Added, got notificaton token ${result.notificationDetails.token} and url ${result.notificationDetails.url}`
            : "Added, got no notification details"
        );
      } else {
        setAddFrameResult(
          `Not added: ${result.reason} | ${JSON.stringify(result)}`
        );
      }
    } catch (error) {
      setAddFrameResult(`Error: ${error}`);
    }
  }, []);

  async function handleCaptchaSubmission(token: string | null) {
    try {
      if (token) {
        await fetch("/api/recaptcha", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
        setIsVerified(true);
      }
    } catch (e) {
      setIsVerified(false);
    }
  }

  const handleChange = (token: string | null) => {
    handleCaptchaSubmission(token);
  };

  function handleExpired() {
    setIsVerified(false);
  }

  if (!isSDKLoaded || targetIsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      <div className="w-[320px] h-[480px] flex flex-col justify-between items-center mt-16 mx-auto py-2 px-2 gap-4">
        {targetData && (
          <div className="w-full bg-slate-100 rounded-lg p-4 shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                <img
                  src={targetData.imageUrl}
                  alt={targetData.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {targetData.displayName}
                </h2>
                <p className="text-sm text-gray-600">@{targetData.fname}</p>
                <p className="text-xs text-gray-500">FID: {targetData.fid}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Human Reports</span>
                <span className="text-sm font-medium text-gray-900">
                  {targetData?.humanReports &&
                    targetData.humanReports.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sybil Reports</span>
                <span className="text-sm font-medium text-gray-900">
                  {targetData?.sybilReports &&
                    targetData.sybilReports.toLocaleString()}
                </span>
              </div>
              {targetData?.sybilProbability && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Sybil Probability
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {(targetData.sybilProbability * 100).toFixed(1) + "%"}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                    <div
                      className="h-full bg-red-600 rounded-full"
                      style={{
                        width: `${targetData.sybilProbability * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {success === undefined && (
          <>
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
              ref={recaptchaRef}
              onChange={handleChange}
              onExpired={handleExpired}
            />
            <div className="grid grid-cols-2 gap-4 w-full">
              <Button
                className="w-full h-12 flex justify-center items-center bg-red-700 hover:bg-red-600 text-white disabled:bg-gray-500"
                onClick={() => {
                  reportSybil({
                    reporterFid: BigInt(807252),
                    targetFid: BigInt(807252),
                    reportedAsSybil: false,
                  });
                }}
                disabled={!isConnected || !isVerified}
              >
                Report Human
              </Button>
              <Button
                className="w-full h-12 bg-red-700 hover:bg-red-600 text-white disabled:bg-gray-500"
                onClick={() => {
                  reportSybil({
                    reporterFid: BigInt(807252),
                    targetFid: BigInt(807252),
                    reportedAsSybil: true,
                  });
                }}
                disabled={!isConnected || !isVerified}
              >
                Report Sybil
              </Button>
            </div>
            <div className="w-full flex flex-col">
              <Button
                className="w-full bg-red-700 hover:bg-red-600 disabled:bg-gray-500"
                onClick={addFrame}
                disabled={added}
              >
                Add frame to client
              </Button>
              <span>{addFrameResult}</span>
            </div>

            <Button
              className="w-full bg-red-700 hover:bg-red-600"
              onClick={() =>
                isConnected
                  ? disconnect()
                  : connect({ connector: config.connectors[0] })
              }
            >
              {isConnected ? "Disconnect wallet" : "Connect wallet"}
            </Button>
          </>
        )}
        {success === true && (
          <>
            <div className="w-full h-full flex flex-col gap-4 items-center justify-start">
              <span>Thanks for your report!</span>
              <Button
                className="w-full h-12 bg-red-700 hover:bg-red-600 text-white"
                onClick={() => {
                  sdk.actions.close();
                }}
              >
                Close frame
              </Button>
            </div>
          </>
        )}
        {success === false && (
          <>
            <div className="w-full h-full flex flex-col gap-4 items-center justify-start">
              <span>Sorry, an unexpected error occurred!</span>
              <Button
                className="w-full h-12 bg-red-700 hover:bg-red-600 text-white"
                onClick={() => {
                  sdk.actions.close();
                }}
              >
                Close frame
              </Button>
            </div>
          </>
        )}

        {attestationError && JSON.stringify(attestationError)}
        {createReportError && JSON.stringify(createReportError)}
      </div>
    </div>
  );
}
