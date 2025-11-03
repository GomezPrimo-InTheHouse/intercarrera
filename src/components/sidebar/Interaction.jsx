import React from "react";
import VoiceCommand from "../voiceCommand/VoiceCommand.jsx";
import SpotifyHistorialTable from "../spotify/SpotifyTableHistorial.jsx";
import SpotifyCommand from "../spotify/SpotifyCommand.jsx";

export default function Interaction() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
           {/* Historial Spotify (sin tocar su estilo/estructura) */}
          
             <h1 className="text-xl font-semibold mb-4">Historial de comandos Spotify</h1>
             <SpotifyHistorialTable pageSize={10} />
          
   
           {/* Voice command (sin tocar estilos) */}
           <div className="mt-8">
             <VoiceCommand />
           </div>

            {/* Spotify command (sin tocar estilos) */}
            <div className="mt-8 w-full">
              <SpotifyCommand />
            </div>
    </div>
  );
}
