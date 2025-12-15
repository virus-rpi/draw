"use client";

import { useEffect, useState } from "react";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

export default function TldrawEditor() {
  const [roomId, setRoomId] = useState<string>("");

  useEffect(() => {
    // Get or create room ID from URL
    const params = new URLSearchParams(window.location.search);
    let room = params.get("room");

    if (!room) {
      // Generate a simple room ID
      room = Math.random().toString(36).substring(2, 15);
      // Update URL without reload
      const newUrl = `${window.location.pathname}?room=${room}`;
      window.history.replaceState({}, "", newUrl);
    }

    setRoomId(room);
  }, []);

  if (!roomId) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen">
      <Tldraw />
    </div>
  );
}
