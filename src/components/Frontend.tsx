"use client";

import { useEffect, useCallback, useState } from "react";
import sdk, {
  FrameNotificationDetails,
  type FrameContext,
} from "@farcaster/frame-sdk";
import { useAccount, useDisconnect, useConnect, useChainId } from "wagmi";

import { config } from "~/components/providers/WagmiProvider";
import { Button } from "~/components/ui/Button";
import { useRequestAttestation } from "~/hooks/useRequestAttestation";

export default function Frontend(
  { title }: { title?: string } = { title: "Check Sybil" }
) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();

  const [added, setAdded] = useState(false);
  const [notificationDetails, setNotificationDetails] =
    useState<FrameNotificationDetails | null>(null);

  const [lastEvent, setLastEvent] = useState("");

  const [addFrameResult, setAddFrameResult] = useState("");

  useEffect(() => {
    setNotificationDetails(context?.client.notificationDetails ?? null);
  }, [context]);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const {
    attestationData: requestAttestationData,
    requestAttestation,
    error: RequestAttestationError,
    isError: isRequestAttestationError,
    isPending: isRequestAttestationPending,
  } = useRequestAttestation({ chainId, attester: address });

  const { disconnect } = useDisconnect();
  const { connect } = useConnect();

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);
      setAdded(context.client.added);

      sdk.on("frameAdded", ({ notificationDetails }) => {
        setLastEvent(
          `frameAdded${!!notificationDetails ? ", notifications enabled" : ""}`
        );

        setAdded(true);
        if (notificationDetails) {
          setNotificationDetails(notificationDetails);
        }
      });

      sdk.on("frameAddRejected", ({ reason }) => {
        setLastEvent(`frameAddRejected, reason ${reason}`);
      });

      sdk.on("frameRemoved", () => {
        setLastEvent("frameRemoved");
        setAdded(false);
        setNotificationDetails(null);
      });

      sdk.on("notificationsEnabled", ({ notificationDetails }) => {
        setLastEvent("notificationsEnabled");
        setNotificationDetails(notificationDetails);
      });
      sdk.on("notificationsDisabled", () => {
        setLastEvent("notificationsDisabled");
        setNotificationDetails(null);
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
      setNotificationDetails(null);

      const result = await sdk.actions.addFrame();

      if (result.added) {
        if (result.notificationDetails) {
          setNotificationDetails(result.notificationDetails);
        }
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

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  const targetData = {
    fid: 807252,
    fname: "yvezera",
    displayName: "yves",
    imageUrl:
      "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/ebee2fa0-d63e-4060-ec0e-d2b30abae800/rectcrop3",
    humanReports: 1256763,
    sybilReports: 1876241,
    sybilProbability: 0.5787,
  };
  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      <div className="w-[300px] h-[540px] flex flex-col justify-between items-center mt-16 mx-auto py-2 px-2 gap-4">
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
                {targetData.humanReports.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Sybil Reports</span>
              <span className="text-sm font-medium text-gray-900">
                {targetData.sybilReports.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sybil Probability</span>
                <span className="text-sm font-medium text-gray-900">
                  {(targetData.sybilProbability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                <div
                  className="h-full bg-red-600 rounded-full"
                  style={{ width: `${targetData.sybilProbability * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        <Button
          className="w-full bg-red-700 hover:bg-red-600 text-white disabled:bg-gray-500"
          onClick={() => {
            requestAttestation(
              BigInt(targetData.fid),
              BigInt(targetData.fid),
              false
            );
          }}
          disabled={!isConnected}
        >
          Report Human
        </Button>
        <Button
          className="w-full bg-red-700 hover:bg-red-600 text-white disabled:bg-gray-500"
          disabled={!isConnected}
          onClick={() => {
            requestAttestation(
              BigInt(targetData.fid),
              BigInt(targetData.fid),
              true
            );
          }}
        >
          Report Sybil
        </Button>
        <div className="w-full flex flex-col">
          <Button
            className="w-full bg-red-700 hover:bg-red-600 disabled:bg-gray-500"
            onClick={addFrame}
            disabled={!isConnected}
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
      </div>
    </div>
  );
}
