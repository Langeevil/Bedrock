import { Mic, MicOff, Video, VideoOff, PhoneOff, Share2, Settings } from "lucide-react";

interface MeetingControlsProps {
  isMuted: boolean;
  isVideoOn: boolean;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onLeave: () => void;
  onShare: () => void;
  onSettings: () => void;
}

export function MeetingControls({
  isMuted,
  isVideoOn,
  onToggleMic,
  onToggleVideo,
  onLeave,
  onShare,
  onSettings,
}: Readonly<MeetingControlsProps>) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        justifyContent: "center",
        alignItems: "center",
        padding: "16px 12px",
        background: "#1a1a1a",
        borderTop: `1px solid #333`,
      }}
    >
      {/* Mic Button */}
      <button
        onClick={onToggleMic}
        title={isMuted ? "Ativar microfone" : "Desativar microfone"}
        style={{
          width: 44,
          height: 44,
          borderRadius: 0,
          background: isMuted ? "#e74c3c" : "#27ae60",
          border: "none",
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = isMuted
            ? "#c0392b"
            : "#229954";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = isMuted
            ? "#e74c3c"
            : "#27ae60";
        }}
      >
        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
      </button>

      {/* Video Button */}
      <button
        onClick={onToggleVideo}
        title={isVideoOn ? "Desativar câmera" : "Ativar câmera"}
        style={{
          width: 44,
          height: 44,
          borderRadius: 0,
          background: isVideoOn ? "#27ae60" : "#e74c3c",
          border: "none",
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = isVideoOn
            ? "#229954"
            : "#c0392b";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = isVideoOn
            ? "#27ae60"
            : "#e74c3c";
        }}
      >
        {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
      </button>

      {/* Share Button */}
      <button
        onClick={onShare}
        title="Compartilhar tela"
        style={{
          width: 44,
          height: 44,
          borderRadius: 0,
          background: "#3498db",
          border: "none",
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#2980b9";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#3498db";
        }}
      >
        <Share2 size={20} />
      </button>

      {/* Settings Button */}
      <button
        onClick={onSettings}
        title="Configurações"
        style={{
          width: 44,
          height: 44,
          borderRadius: 0,
          background: "#95a5a6",
          border: "none",
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#7f8c8d";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#95a5a6";
        }}
      >
        <Settings size={20} />
      </button>

      {/* Separator */}
      <div
        style={{
          width: 1,
          height: 30,
          background: "#444",
        }}
      />

      {/* Leave Button */}
      <button
        onClick={onLeave}
        title="Sair da reunião"
        style={{
          width: 44,
          height: 44,
          borderRadius: 0,
          background: "#c0392b",
          border: "none",
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#a93226";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#c0392b";
        }}
      >
        <PhoneOff size={20} />
      </button>
    </div>
  );
}
