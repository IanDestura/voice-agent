"use client";

import React from "react";
import Image from "next/image";
import useVapi from "./hooks/useVapi";
import Background from "./components/Background";

export default function Page() {
  console.log("Page component rendering");
  const { isSessionActive, volumeLevel, conversation, toggleCall } = useVapi();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Background />
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center w-full max-w-xl px-4">
        <div className="relative w-40 h-40 mx-auto">
          <Image
            src="/zienna.png"
            alt="Zienna's Logo"
            width={160}
            height={160}
            className="object-contain drop-shadow-xl brightness-110"
            priority
          />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-white welcome-text">
          Welcome to McDonald&apos;s
        </h1>
        <p className="mt-2 text-xl text-[#FFC72C] welcome-text">
          I&apos;m Lovin&apos; It
        </p>
        <p className="mt-4 text-white/90 welcome-text text-lg">
          Click the microphone to start your order
        </p>
      </div>
      <button
        onClick={toggleCall}
        className={`
          w-24 h-24 rounded-full flex items-center justify-center relative
          transition-all duration-300 ease-in-out z-50
          bg-[#DA291C] hover:bg-[#c11f11] active:bg-[#a91b0e]
          shadow-lg hover:shadow-xl
          cursor-pointer
          ${isSessionActive ? "ripple" : ""}
        `}
        style={{
          transform: `scale(${1 + Math.min(volumeLevel * 0.5, 0.3)})`,
          transition: "transform 0.05s ease-out",
        }}
      >
        <div className="relative w-12 h-12 p-2">
          <Image
            src="/zienna.png"
            alt="Zienna's Logo"
            width={48}
            height={48}
            className={`object-contain transition-transform duration-200 ${
              isSessionActive ? "scale-90" : "scale-100"
            }`}
          />
        </div>
      </button>

      {conversation.length > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-md p-4">
          <div
            className={`p-4 rounded-lg shadow-lg transition-opacity duration-200 backdrop-blur-sm ${
              conversation[conversation.length - 1].role === "assistant"
                ? "bg-[#DA291C]/90 text-white"
                : "bg-white/90 text-gray-800"
            } ${
              conversation[conversation.length - 1].final === false
                ? "opacity-70"
                : "opacity-100"
            }`}
          >
            {conversation[conversation.length - 1].text}
          </div>
        </div>
      )}
    </div>
  );
}
