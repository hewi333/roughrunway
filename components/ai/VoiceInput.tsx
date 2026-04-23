"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
  disabled?: boolean;
}

type VoiceState = "idle" | "listening" | "unsupported";

// Web Speech API types aren't in every TS lib — declare minimally.
declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    SpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: (e: { results: { 0: { 0: { transcript: string } } }[] }) => void;
  onerror: () => void;
  onend: () => void;
  start(): void;
  stop(): void;
  abort(): void;
}

export default function VoiceInput({ onTranscript, className, disabled }: VoiceInputProps) {
  const [state, setState] = useState<VoiceState>("idle");
  const recogRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setState("unsupported");
    }
    return () => {
      recogRef.current?.abort();
    };
  }, []);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const r = new SpeechRecognition();
    r.lang = "en-US";
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e) => {
      const result = e.results[0];
      const transcript = (result as any)?.[0]?.transcript ?? "";
      if (transcript) onTranscript(transcript);
      setState("idle");
    };
    r.onerror = () => setState("idle");
    r.onend = () => setState("idle");
    recogRef.current = r;
    r.start();
    setState("listening");
  };

  const stopListening = () => {
    recogRef.current?.stop();
    setState("idle");
  };

  if (state === "unsupported") return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 w-8 p-0 shrink-0",
        state === "listening" && "text-aviation-red dark:text-aviation-red-dark",
        className
      )}
      title={state === "listening" ? "Tap to stop" : "Voice input"}
      disabled={disabled}
      onClick={state === "listening" ? stopListening : startListening}
      aria-label={state === "listening" ? "Stop recording" : "Start voice input"}
      data-action="voice-input"
    >
      {state === "listening" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}
