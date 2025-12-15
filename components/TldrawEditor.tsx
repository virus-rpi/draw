"use client";

import { useEffect, useState } from "react";
import { Tldraw } from "tldraw";
import { useSyncDemo } from "@tldraw/sync";
import "tldraw/tldraw.css";

export default function TldrawEditor() {
  const [roomId, setRoomId] = useState<string>("");

  useEffect(() => {
    // Get or create room ID from URL
    const params = new URLSearchParams(window.location.search);
    let room = params.get("room");

    if (!room) {
      // Generate a cryptographically secure room ID
      room = crypto.randomUUID();
      // Update URL without reload
      const newUrl = `${window.location.pathname}?room=${room}`;
      window.history.replaceState({}, "", newUrl);
    }

    setRoomId(room);
  }, []);

  // Use tldraw sync demo for multiplayer collaboration
  const store = useSyncDemo({ roomId });

  if (!roomId) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen">
      <Tldraw store={store} />
    </div>
  );
}
