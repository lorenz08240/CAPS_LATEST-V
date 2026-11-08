import React from "react";
import EyeTracker from "../EyeTracker/EyeTracker";
import "./BobCompanion.css";

const BOB_PHRASES = [
  "Hi there! I'm B.O.B.",
  "Hey, I see you.",
  "That tickles!",
  "Stop poking me.",
  "I'm watching your build.",
  "Boop.",
  "You found me!",
  "Again? Okay."
];

export default function BobCompanion({
  speechLines,
  externalSpeech,
  dockRight = 32,
  size = 112,
  isCenter = false,
}) {
  const activePool = speechLines && speechLines.length > 0 ? speechLines : BOB_PHRASES;

  return (
    <div
      className={`bob-floating-free ${isCenter ? "bob-centered" : ""}`}
      style={{
        "--bob-right": `${dockRight}px`,
      }}
      aria-label="B.O.B."
    >
      <div className="bob-free-stage" title="B.O.B. (Poke me!)">
        <EyeTracker
          size={size}
          shape="Cube"
          eyes="Squares"
          bodyColor="#00e5a0"
          eyeColor="#06080e"
          follow={90}
          bounce={55}
          speechLines={activePool}
          externalSpeech={externalSpeech}
        />
      </div>
    </div>
  );
}