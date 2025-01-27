"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import useVapi from "../hooks/useVapi";

export default function VoiceWidget() {
  const { isSessionActive, volumeLevel, toggleCall, conversation } = useVapi();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [endMessage, setEndMessage] = useState("");

  // Initialize Vapi and handle state changes
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
    }

    // Handle call end message
    if (!isSessionActive && endMessage) {
      window.parent?.postMessage(
        {
          type: "vapiState",
          state: "idle",
          conversation: endMessage,
          role: "assistant",
        },
        "*"
      );
      // Clear end message after sending
      setTimeout(() => setEndMessage(""), 3000);
    } else {
      // Regular state and conversation changes
      window.parent?.postMessage(
        {
          type: "vapiState",
          state: isSessionActive ? "active" : "idle",
          volumeLevel,
          conversation: conversation[conversation.length - 1]?.text || "",
          role: conversation[conversation.length - 1]?.role || "assistant",
        },
        "*"
      );
    }

    // Reset loading state when session becomes active
    if (isSessionActive) {
      setIsLoading(false);
      setEndMessage(""); // Clear any previous end message
    }
  }, [isSessionActive, volumeLevel, conversation, isInitialized, endMessage]);

  // Handle click events
  const handleClick = async () => {
    if (isSessionActive) {
      setEndMessage("Call ended. Thank you for using voice assistant!");
      await toggleCall();
      return;
    }

    setIsLoading(true);
    // Notify parent to show loading message
    window.parent?.postMessage(
      {
        type: "vapiState",
        state: "loading",
        conversation: "Initializing voice assistant...",
      },
      "*"
    );

    try {
      // Request microphone permission first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop()); // Clean up the stream
      await toggleCall();
    } catch (error) {
      console.error("Failed to toggle voice call:", error);
      setIsLoading(false);
      setEndMessage("Failed to start voice assistant. Please try again.");
      window.parent?.postMessage(
        {
          type: "vapiError",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        "*"
      );
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent overflow-hidden">
      <button
        onClick={handleClick}
        type="button"
        disabled={isLoading}
        className={`
          relative w-full h-full flex items-center justify-center
          transition-all duration-300 ease-in-out overflow-hidden
          cursor-pointer focus:outline-none
          ${isSessionActive ? "scale-90" : "scale-100"}
          ${isSessionActive ? "ripple" : ""}
        `}
        aria-label={
          isLoading
            ? "Initializing voice assistant"
            : isSessionActive
            ? "Stop voice interaction"
            : "Start voice interaction"
        }
      >
        <Image
          src="/zienna.png"
          alt="Zienna's Logo"
          width={96}
          height={96}
          className={`
            w-2/3
            h-2/3
            object-contain
            mx-auto
            brightness-110
            transition-all
            duration-200
            animate-[float_3s_ease-in-out_infinite]
            ${isSessionActive ? "scale-90" : "scale-100"}
          `}
          priority
        />
      </button>
    </div>
  );
}
