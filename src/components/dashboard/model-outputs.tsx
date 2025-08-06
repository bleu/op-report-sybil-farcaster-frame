import { StatsFormatted } from "~/lib/dashboard-types";
import { GraphLayout } from "./graph-layout";
import { useRef, useEffect, useState } from "react";
import { cn } from "~/lib/utils";

const BarSegment = ({
  subItem,
  index,
  totalItems,
  color,
}: {
  subItem: any;
  index: number;
  totalItems: number;
  color: string;
}) => {
  const [textFits, setTextFits] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = textRef.current.scrollWidth;
      setTextFits(textWidth <= containerWidth - 8); // 8px padding
    }
  }, [subItem.percentage]);

  const positionLeft = totalItems >= 3 && index === 0;
  const positionRight = totalItems >= 3 && index === totalItems - 1;
  const positionMiddle =
    (index !== 0 && index !== totalItems - 1) || totalItems <= 2;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full border-x border-gray-400 flex-col flex items-center justify-center min-w-2",
        color,
        index === 0 && "border-l-0",
        index === totalItems - 1 && "border-r-0"
      )}
      style={{
        width: `${subItem.percentage}%`,
        borderRadius:
          index === 0
            ? "10px 0 0 10px"
            : index === totalItems - 1
            ? "0 10px 10px 0"
            : "0",
        zIndex: index,
      }}
    >
      {/* Content inside bar */}
      <div
        ref={textRef}
        className={cn(
          "flex flex-col w-fit self-center items-center justify-center text-white/90",
          textFits ? "opacity-100" : "opacity-0"
        )}
      >
        <p className="text-xs">{subItem.label}</p>
        <p className="text-lg">{subItem.value.toLocaleString()}</p>
      </div>

      {/* Fallback: label below with dashed line */}
      {!textFits && (
        <div
          className={cn(
            "absolute",
            textFits ? "hidden" : "block",
            positionLeft && "-left-24",
            positionRight && "-right-24",
            positionMiddle && "-bottom-12 left-1/2 -translate-x-1/2"
          )}
        >
          {positionLeft && (
            <div
              className="absolute w-4 h-px"
              style={{
                left: "calc(100% + 8px)",
                top: "50%",
                borderTop: "2px dashed #9ca3af",
              }}
            />
          )}
          {positionRight && (
            <div
              className="absolute w-4 h-px"
              style={{
                right: "100%",
                top: "50%",
                borderTop: "2px dashed #9ca3af",
              }}
            />
          )}
          {positionMiddle && (
            <div
              className="absolute w-px h-8"
              style={{
                left: "50%",
                top: "-32px",
                borderLeft: "2px dashed #9ca3af",
              }}
            />
          )}
          {/* Label */}
          <div className="text-xs text-center whitespace-nowrap">
            <p>{subItem.label}</p>
            <p className="font-semibold">{subItem.value.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const ModelOutputs = ({ data }: { data: StatsFormatted }) => {
  const formattedData = [
    {
      id: "Sybil",
      label: "Sybil detections",
      items: [
        {
          id: "correct",
          label: "Actual Sybils",
          value: data.true_detected_sybils,
          percentage:
            data.detected_sybils > 0
              ? (data.true_detected_sybils / data.detected_sybils) * 100
              : 0,
          color: "bg-red-600",
        },
        {
          id: "incorrect",
          label: "False Sybils",
          value: data.false_detected_sybils,
          percentage:
            data.detected_sybils > 0
              ? (data.false_detected_sybils / data.detected_sybils) * 100
              : 0,
          color: "bg-red-600/80",
        },
      ],
    },
    {
      id: "Benign",
      label: "Benign detections",
      items: [
        {
          id: "correct",
          label: "Actual Benigns",
          value: data.true_detected_benigns,
          percentage:
            data.detected_benigns > 0
              ? (data.true_detected_benigns / data.detected_benigns) * 100
              : 0,
          color: "bg-blue-600",
        },
        {
          id: "incorrect",
          label: "False Benigns",
          value: data.false_detected_benigns,
          percentage:
            data.detected_benigns > 0
              ? (data.false_detected_benigns / data.detected_benigns) * 100
              : 0,
          color: "bg-blue-600/80",
        },
      ],
    },
    {
      id: "Unknown",
      label: "Unknown detections",
      items: [
        {
          id: "correct",
          label: "Unknown",
          value: data.true_unknowns,
          percentage:
            data.detected_unknowns > 0
              ? (data.true_unknowns / data.detected_unknowns) * 100
              : 0,
          color: "bg-gray-600",
        },
        {
          id: "sybil",
          label: "Sybil reports",
          value: data.sybils_detected_unknowns,
          percentage:
            data.detected_unknowns > 0
              ? (data.sybils_detected_unknowns / data.detected_unknowns) * 100
              : 0,
          color: "bg-red-600",
        },
        {
          id: "benign",
          label: "Benign reports",
          value: data.benigns_detected_unknowns,
          percentage:
            data.detected_unknowns > 0
              ? (data.benigns_detected_unknowns / data.detected_unknowns) * 100
              : 0,
          color: "bg-blue-600",
        },
      ],
    },
  ];

  return (
    <GraphLayout title="Model Outputs">
      <div className="flex flex-col gap-6 justify-between">
        {formattedData.map((item) => (
          <div key={item.id}>
            <h3>{item.label}</h3>
            <div className="flex flex-row h-14">
              {item.items.map((subItem, index) => (
                <BarSegment
                  key={subItem.id}
                  subItem={subItem}
                  index={index}
                  totalItems={item.items.length}
                  color={subItem.color}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </GraphLayout>
  );
};
