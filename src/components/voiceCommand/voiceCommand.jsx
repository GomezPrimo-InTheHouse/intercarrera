// import { useEffect, useRef, useState } from "react";
// import { sendVoiceCommand } from "../../api/conectionApi";

// export default function VoiceCommand() {
//   const [recorder, setRecorder] = useState(null);
//   const [recording, setRecording] = useState(false);
//   const [elapsed, setElapsed] = useState(0);
//   const [status, setStatus] = useState("Listo para escuchar");
//   const [transcript, setTranscript] = useState("");
//   const [result, setResult] = useState(null); // { text, track }
//   const [error, setError] = useState("");
//   const timerRef = useRef(null);
//   const chunksRef = useRef([]);
//   const streamRef = useRef(null);

//   useEffect(() => {
//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current);
//       if (recorder && recorder.state !== "inactive") recorder.stop();
//       if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
//     };
//   }, [recorder]);

//   const startTimer = () => {
//     setElapsed(0);
//     timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
//   };

//   const stopTimer = () => {
//     if (timerRef.current) clearInterval(timerRef.current);
//     timerRef.current = null;
//   };

//   const startRecording = async () => {
//     setError("");
//     setResult(null);
//     setTranscript("");
//     setStatus("Obteniendo permiso del micrófono…");
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       streamRef.current = stream;
//       const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
//       chunksRef.current = [];

//       mr.ondataavailable = (e) => {
//         if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
//       };

//       mr.onstart = () => {
//         setStatus("Grabando…");
//         setRecording(true);
//         startTimer();
//       };

//       mr.onstop = async () => {
//         stopTimer();
//         setStatus("Procesando audio…");
//         setRecording(false);
//         // Detener tracks del micrófono
//         stream.getTracks().forEach((t) => t.stop());

//         const blob = new Blob(chunksRef.current, { type: "audio/webm" });

//         try {
//           const data = await sendVoiceCommand(blob);
//           setTranscript(data.text || "");
//           setResult(data);
//           setStatus("Listo ✅");
//         } catch (err) {
//           setError(err.message || "Error desconocido");
//           setStatus("Ocurrió un error");
//         }
//       };

//       mr.start();
//       setRecorder(mr);
//     } catch (err) {
//       setError("No se pudo acceder al micrófono. Revisá los permisos del navegador.");
//       setStatus("Permiso denegado");
//     }
//   };

//   const stopRecording = () => {
//     if (recorder && recorder.state === "recording") {
//       recorder.stop();
//     }
//   };

//   const secondsToMMSS = (s) =>
//     `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

//   return (
//     <div className="w-full max-w-xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-[#E5E5E5]">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-xl font-semibold text-[#212121]">Comandos por voz</h3>
//         <span className="text-sm text-[#979590]">{status}</span>
//       </div>

//       {/* Card de micrófono */}
//       <div className="flex items-center gap-4 p-4 rounded-xl border border-[#D8D8D8] bg-[#FDFDFD]">
//         <div
//           className={`w-14 h-14 rounded-full grid place-items-center ${
//             recording ? "bg-[#D7BFA8]" : "bg-[#5C7A8B]"
//           } shadow`}
//         >
//           <div
//             className={`w-6 h-6 rounded-full ${
//               recording ? "bg-[#212121]" : "bg-white"
//             }`}
//           />
//         </div>

//         <div className="flex-1">
//           <p className="text-sm text-[#979590]">
//             Presioná para hablar y soltar para procesar
//           </p>
//           <p className="text-lg font-semibold text-[#212121] tracking-wide mt-1">
//             {secondsToMMSS(elapsed)}
//           </p>
//         </div>

//         <div className="flex gap-2">
//           {!recording ? (
//             <button
//               onClick={startRecording}
//               className="px-4 py-2 rounded-lg bg-[#5C7A8B] text-white font-medium hover:bg-[#4a6675] transition"
//             >
//               🎙️ Grabar
//             </button>
//           ) : (
//             <button
//               onClick={stopRecording}
//               className="px-4 py-2 rounded-lg bg-[#D7BFA8] text-[#212121] font-medium hover:bg-[#c6ab91] transition"
//             >
//               ⏹️ Detener
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Resultado */}
//       {error && (
//         <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
//           {error}
//         </div>
//       )}

//       {transcript && (
//         <div className="mt-4 p-4 rounded-xl border border-[#E5E5E5] bg-white">
//           <p className="text-xs uppercase tracking-wider text-[#979590] mb-2">
//             Transcripción
//           </p>
//           <p className="text-[#212121]">{transcript}</p>
//         </div>
//       )}

//       {result?.track && (
//         <div className="mt-4 p-4 rounded-xl border border-[#E5E5E5] bg-white flex items-center gap-4">
//           <img
//             src={result.track.image || "/favicon.svg"}
//             alt="cover"
//             className="w-16 h-16 rounded-lg object-cover border border-[#D8D8D8]"
//           />
//           <div className="flex-1">
//             <p className="text-sm text-[#979590]">Reproduciendo en Spotify</p>
//             <p className="text-lg font-semibold text-[#212121]">
//               {result.track.name}
//             </p>
//             <p className="text-sm text-[#979590]">
//               {result.track.artist}
//             </p>
//           </div>
//           {result.track.url && (
//             <a
//               href={result.track.url}
//               target="_blank"
//               rel="noreferrer"
//               className="px-3 py-2 rounded-md bg-[#5C7A8B] text-white text-sm hover:bg-[#4a6675]"
//             >
//               Abrir
//             </a>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// src/components/VoiceCommand.jsx
import { useState, useRef } from "react";
import { sendVoiceCommand } from "../../api/conectionApi";
import { motion } from "framer-motion";

export default function VoiceCommand() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [elapsed, setElapsed] = useState(0); // ⏱ contador de segundos
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    setTranscript("");
    setError("");
    setElapsed(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstart = () => {
        console.log("🎙️ Grabación iniciada");
        setIsRecording(true);
        startTimer();
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log("🛑 Grabación detenida");
        stopTimer();
        setIsRecording(false);

        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

        // ✅ Logs de depuración
        console.log("Audio blob:", audioBlob);
        console.log("Tamaño:", audioBlob.size);
        console.log("Tipo:", audioBlob.type);

        chunksRef.current = [];

        try {
          const response = await sendVoiceCommand(audioBlob);
          console.log("📡 Respuesta del backend:", response);
          setTranscript(response.text || "Sin transcripción recibida");
        } catch (err) {
          console.error("❌ Error enviando audio:", err);
          setError("Error enviando audio al servidor");
        }
      };

      mediaRecorderRef.current.start();
    } catch (err) {
      console.error("❌ Error accediendo al micrófono:", err);
      setError("No se pudo acceder al micrófono");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 bg-[#212121] text-[#D8D8D8] rounded-2xl shadow-xl w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold text-[#D7BFA8]">
        Asistente de Voz
      </h2>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-24 h-24 rounded-full flex items-center justify-center text-lg font-semibold transition-all ${
          isRecording
            ? "bg-red-600 animate-pulse"
            : "bg-[#5C7A8B] hover:bg-[#4C6E7A]"
        }`}
      >
        {isRecording ? "Detener" : "Grabar"}
      </motion.button>

      {/* Indicador de grabación */}
      <div className="h-6">
        {isRecording ? (
          <p className="text-[#D7BFA8] animate-pulse">
            ⏱ Grabando... {elapsed}s
          </p>
        ) : (
          <p className="text-[#979590]">Presioná para grabar</p>
        )}
      </div>

      {/* Resultado */}
      {transcript && (
        <div className="bg-[#5C7A8B]/20 p-4 rounded-xl w-full text-center mt-4">
          <h3 className="text-[#D7BFA8] font-semibold mb-2">
            Transcripción:
          </h3>
          <p>{transcript}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm text-center mt-2">{error}</p>
      )}
    </div>
  );
}
