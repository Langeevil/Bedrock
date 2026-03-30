import { useEffect, useRef, useState } from "react";
import { TEAMS } from "../../constants/teamsTheme";
import { Mic, MicOff } from "lucide-react";

export interface VideoStream {
  userId: number;
  userName: string;
  stream?: MediaStream;
  isLocalStream: boolean;
  isMuted: boolean;
}

interface VideoGridProps {
  videoStreams: VideoStream[];
}

function VideoTile({
  stream,
  userName,
  isLocalStream,
  isMuted,
}: Readonly<{
  stream?: MediaStream;
  userName: string;
  isLocalStream: boolean;
  isMuted: boolean;
}>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(stream ? stream.getVideoTracks().length > 0 : false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {
        setHasVideo(false);
      });
    }
  }, [stream]);

  return (
    <div
      style={{
        position: "relative",
        background: "#1a1a1a",
        border: `1px solid #333`,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 200,
      }}
    >
      {hasVideo && stream && stream.getVideoTracks().length > 0 ? (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocalStream}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            width: "100%",
            height: "100%",
            background: "#2a2a2a",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 0,
              background: TEAMS.purple,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div style={{ fontSize: 13, color: "#ddd", fontWeight: 500 }}>
            Câmera desativada
          </div>
        </div>
      )}

      {/* Overlay com nome */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))",
          padding: "12px 8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 12, color: "white", fontWeight: 500, textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
          {userName}
          {isLocalStream && (
            <span style={{ fontSize: 10, color: "#bbb", marginLeft: 4 }}>(Você)</span>
          )}
        </div>
        <div style={{ color: isMuted ? "#e74c3c" : "#27ae60" }}>
          {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
        </div>
      </div>

      {/* Indicador de Local */}
      {isLocalStream && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            fontSize: 10,
            background: "rgba(0,0,0,0.6)",
            color: "#27ae60",
            padding: "2px 6px",
            fontWeight: 600,
          }}
        >
          LOCAL
        </div>
      )}
    </div>
  );
}

export function VideoGrid({ videoStreams }: Readonly<VideoGridProps>) {
  // Responsivo: calcula colunas baseado na quantidade
  const getGridCols = (count: number) => {
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count <= 4) return 2;
    if (count <= 9) return 3;
    return 4;
  };

  const cols = getGridCols(videoStreams.length);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 1,
        background: "#0a0a0a",
        flex: 1,
        overflow: "auto",
      }}
    >
      {videoStreams.length === 0 ? (
        <div
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 400,
            color: "#888",
            fontSize: 14,
          }}
        >
          Nenhum participante ativo ainda
        </div>
      ) : (
        videoStreams.map((stream) => (
          <VideoTile
            key={`${stream.userId}-${stream.isLocalStream}`}
            stream={stream.stream}
            userName={stream.userName}
            isLocalStream={stream.isLocalStream}
            isMuted={stream.isMuted}
          />
        ))
      )}
    </div>
  );
}
