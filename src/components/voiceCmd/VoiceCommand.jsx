
import { useState, useRef, useEffect } from "react";
import { sendVoiceCommand } from "../../api/unifiedApi.js"; 

import { motion } from "framer-motion";

export default function VoiceCommand() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // Popup/login control
  const popupRef = useRef(null);
  const authInProgressRef = useRef(false);

  useEffect(() => () => {
    try { popupRef.current?.close(); } catch {}
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  }, []);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  };
  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  const startRecording = async () => {
    setTranscript(""); setError(""); setElapsed(0);

    // pre-abrí popup en el click
    try {
      if (!popupRef.current || popupRef.current.closed) {
        popupRef.current = window.open("about:blank", "spotifyAuth", "width=500,height=720");
      }
    } catch { popupRef.current = null; }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = (MediaRecorder.isTypeSupported?.("audio/webm;codecs=opus") && "audio/webm;codecs=opus")
                || (MediaRecorder.isTypeSupported?.("audio/webm") && "audio/webm")
                || "";
      mediaRecorderRef.current = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => { if (e.data?.size) chunksRef.current.push(e.data); };
      mediaRecorderRef.current.onstart = () => { setIsRecording(true); startTimer(); console.log("🎙️ Grabación iniciada"); };
      mediaRecorderRef.current.onstop = async () => {
        console.log("🛑 Grabación detenida");
        stopTimer(); setIsRecording(false);
        const chunkType = chunksRef.current[0]?.type || "audio/webm";
        const audioBlob = new Blob(chunksRef.current, { type: chunkType });
        chunksRef.current = [];
        console.log("Audio blob:", audioBlob, "size:", audioBlob.size, "type:", audioBlob.type);

        try {
          const response = await sendVoiceCommand(audioBlob, { popupRef, authInProgressRef });
          setTranscript(response.text || response.transcript || "Sin transcripción recibida");
          if (!authInProgressRef.current && popupRef.current) popupRef.current.close();
        } catch (err) {
          console.error("❌ Error enviando audio:", err);
          setError(err?.message || "Error enviando audio al servidor");
          if (err?.needManualLogin && err.loginUrl) {
            try { window.open(err.loginUrl, "spotifyAuth", "width=500,height=720"); } catch { window.location.href = err.loginUrl; }
          }
        } finally {
          try { mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop()); } catch {}
        }
      };

      mediaRecorderRef.current.start();
    } catch (e) {
      console.error("❌ mic error:", e);
      setError("No se pudo acceder al micrófono");
      try { if (popupRef.current && !authInProgressRef.current) popupRef.current.close(); } catch {}
    }
  };

  const stopRecording = () => { try { mediaRecorderRef.current?.stop(); } catch(e){} };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 bg-[#212121] text-[#D8D8D8] rounded-2xl shadow-xl w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold text-[#D7BFA8]">Asistente de Voz</h2>
      <motion.button whileTap={{ scale: 0.9 }} onClick={isRecording ? stopRecording : startRecording}
        className={`w-24 h-24 rounded-full flex items-center justify-center text-lg font-semibold transition-all ${isRecording ? "bg-red-600 animate-pulse" : "bg-[#5C7A8B] hover:bg-[#4C6E7A]"}`}>
        {isRecording ? "Detener" : "Grabar"}
      </motion.button>
      <div className="h-6">{isRecording ? <p className="text-[#D7BFA8] animate-pulse">⏱ Grabando... {elapsed}s</p> : <p className="text-[#979590]">Presioná para grabar</p>}</div>
      {transcript && (<div className="bg-[#5C7A8B]/20 p-4 rounded-xl w-full text-center mt-4"><h3 className="text-[#D7BFA8] font-semibold mb-2">Transcripción:</h3><p>{transcript}</p></div>)}
      {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
    </div>
  );
}
