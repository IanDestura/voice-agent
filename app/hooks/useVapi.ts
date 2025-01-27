import { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";

interface VapiMessage {
  type: string;
  transcriptType?: string;
  role?: string;
  transcript?: string;
}

interface VapiError {
  error?: {
    code?: number;
  };
  errorMsg?: string;
  action?: string;
  callClientId?: string;
}

const useVapi = () => {
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [conversation, setConversation] = useState<
    { role: string; text: string; final?: boolean }[]
  >([]);
  const vapiRef = useRef<Vapi | null>(null);

  // Initialize microphone access early
  useEffect(() => {
    const initializeMicrophone = async (retryCount = 0) => {
      console.log("[Voice Agent] Starting microphone initialization...");
      try {
        // Wait for devices to be ready
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log("[Voice Agent] Enumerating audio devices...");
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(
          (device) => device.kind === "audioinput"
        );

        console.log("[Voice Agent] Found audio devices:", audioDevices.length);

        if (audioDevices.length === 0 && retryCount < 3) {
          console.log("[Voice Agent] No devices found, retrying...");
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return initializeMicrophone(retryCount + 1);
        } else if (audioDevices.length === 0) {
          throw new Error("No microphone devices found after retries");
        }

        console.log("[Voice Agent] Requesting microphone permissions...");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 48000,
            sampleSize: 16,
          },
        });
        stream.getTracks().forEach((track) => track.stop()); // Clean up
        console.log("[Voice Agent] Microphone permissions granted");
      } catch (error) {
        console.warn("[Voice Agent] Microphone initialization failed:", error);
      }
    };

    initializeMicrophone();
  }, []);

  useEffect(() => {
    const publicKey = "e1252025-845b-4ae0-b3b6-8ec272ae6ad6";
    if (!publicKey) {
      throw new Error("NEXT_PUBLIC_VAPI_PUBLIC_KEY is not defined");
    }

    console.log("[Voice Agent] Initializing Vapi instance...");
    const vapiInstance = new Vapi(publicKey);
    vapiRef.current = vapiInstance;
    console.log("[Voice Agent] Vapi instance created");

    // Set up event listeners
    vapiInstance.on("call-start", () => {
      console.log("[Voice Agent] Call started");
      setIsSessionActive(true);
    });

    vapiInstance.on("call-end", () => {
      console.log("[Voice Agent] Call ended");
      setIsSessionActive(false);
      setConversation([]);

      // Notify parent window of call end
      if (typeof window !== "undefined" && window.parent) {
        window.parent.postMessage(
          {
            type: "vapiState",
            state: "idle",
            conversation: "",
          },
          "*"
        );
      }
    });

    vapiInstance.on("volume-level", (volume: number) => {
      console.log("[Voice Agent] Volume level:", volume);
      setVolumeLevel(volume);
    });

    vapiInstance.on("message", (message: VapiMessage) => {
      if (message.type === "transcript" && message.role && message.transcript) {
        setConversation((prev) => {
          const newMessage = {
            role: message.role as string,
            text: message.transcript as string,
            final: message.transcriptType === "final",
          };

          if (message.transcriptType === "final" || prev.length === 0) {
            return [...prev, newMessage];
          }

          const allButLast = prev.slice(0, -1);
          return [...allButLast, newMessage];
        });
      }
    });

    vapiInstance.on("error", async (e: Error | VapiError) => {
      console.error("Vapi error:", e);

      // Handle WebSocket connection errors
      const vapiError = e as VapiError;
      if (
        vapiError.error?.code === 4100 ||
        (vapiError.errorMsg && vapiError.errorMsg.includes("WebSocket"))
      ) {
        console.log(
          "[Voice Agent] WebSocket error, attempting to reconnect..."
        );
        try {
          await vapiInstance.stop();
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
          if (assistantId) {
            await vapiInstance.start(assistantId);
            return;
          }
        } catch (reconnectError) {
          console.error("[Voice Agent] Reconnection failed:", reconnectError);
        }
      }

      setIsSessionActive(false);
      setConversation([]); // Reset conversation when error occurs

      // Notify parent window of error state
      if (typeof window !== "undefined" && window.parent) {
        window.parent.postMessage(
          {
            type: "vapiState",
            state: "idle",
            conversation:
              vapiError.errorMsg || "Connection error. Please try again.",
          },
          "*"
        );
      }
    });

    return () => {
      vapiInstance.stop();
    };
  }, []);

  const toggleCall = async () => {
    try {
      if (!vapiRef.current) {
        console.error("Vapi instance not initialized");
        return;
      }

      if (isSessionActive) {
        await vapiRef.current.stop();
      } else {
        // Check for available audio devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(
          (device) => device.kind === "audioinput"
        );

        if (audioDevices.length === 0) {
          throw new Error("No microphone devices found");
        }

        const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
        if (!assistantId) {
          throw new Error("NEXT_PUBLIC_VAPI_ASSISTANT_ID is not defined");
        }

        try {
          console.log(
            "[Voice Agent] Starting call with assistant:",
            assistantId
          );
          await vapiRef.current.start(assistantId);
        } catch (error) {
          console.error("[Voice Agent] Failed to start Vapi call:", error);
          setIsSessionActive(false);
          setConversation([]);

          // Notify parent window of error state
          if (typeof window !== "undefined" && window.parent) {
            window.parent.postMessage(
              {
                type: "vapiState",
                state: "idle",
                conversation: "",
              },
              "*"
            );
          }

          // Create a new instance on error
          const publicKey = "e1252025-845b-4ae0-b3b6-8ec272ae6ad6";
          if (publicKey) {
            vapiRef.current = new Vapi(publicKey);
          }
        }
      }
    } catch (error) {
      console.error("Error toggling Vapi session:", error);
      setIsSessionActive(false);
      setConversation([]);

      // Notify parent window of error state
      if (typeof window !== "undefined" && window.parent) {
        window.parent.postMessage(
          {
            type: "vapiState",
            state: "idle",
            conversation: "",
          },
          "*"
        );
      }
    }
  };

  return { volumeLevel, isSessionActive, conversation, toggleCall };
};

export default useVapi;
