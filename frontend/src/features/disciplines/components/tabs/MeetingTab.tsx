import { useState } from "react";
import { MeetingRoom } from "../meeting/MeetingRoom";
import type { Discipline } from "../../services/disciplinesService";

interface Props {
  discipline: Discipline;
  currentUserEmail: string;
  currentUserName: string;
}

export function MeetingTab({
  discipline,
  currentUserEmail,
  currentUserName,
}: Readonly<Props>) {
  const [inMeeting, setInMeeting] = useState(true);

  if (!inMeeting) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 400,
          color: "#666",
          fontSize: 14,
        }}
      >
        Reunião encerrada
      </div>
    );
  }

  return (
    <MeetingRoom
      discipline={discipline}
      currentUserEmail={currentUserEmail}
      currentUserName={currentUserName}
      onLeave={() => setInMeeting(false)}
    />
  );
}
