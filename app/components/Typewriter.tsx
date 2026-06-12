"use client";
import { useEffect, useState } from "react";

interface TypewriterProps {
  text: string;
  speed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export default function Typewriter({
  text,
  speed = 80,
  deleteSpeed = 40,
  pauseDuration = 2000,
  className,
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting" | "waiting">("typing");

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (phase === "typing") {
      if (displayed.length < text.length) {
        timeout = setTimeout(() => {
          setDisplayed(text.slice(0, displayed.length + 1));
        }, speed);
      } else {
        setPhase("pausing");
      }
    }

    if (phase === "pausing") {
      timeout = setTimeout(() => {
        setPhase("deleting");
      }, pauseDuration);
    }

    if (phase === "deleting") {
      if (displayed.length > 0) {
        timeout = setTimeout(() => {
          setDisplayed(text.slice(0, displayed.length - 1));
        }, deleteSpeed);
      } else {
        setPhase("waiting");
      }
    }

    if (phase === "waiting") {
      timeout = setTimeout(() => {
        setPhase("typing");
      }, 500);
    }

    return () => clearTimeout(timeout);
  }, [displayed, phase, text, speed, deleteSpeed, pauseDuration]);

  return (
    <span className={className}>
      {displayed}
      <span
        className="inline-block w-[2px] h-[1em] bg-red-400 ml-[2px] align-middle"
        style={{
          animation: "blink 1s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}