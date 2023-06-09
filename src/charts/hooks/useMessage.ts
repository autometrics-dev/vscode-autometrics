import { useEffect } from "react";

import { useHandler } from "./useHandler";

type EventDataHandler<EventData extends {}> = (
  event: MessageEvent<EventData>,
) => void;

export function useMessage<EventData extends {}>(
  callback: EventDataHandler<EventData>,
): void {
  const handler = useHandler((event: MessageEvent<EventData>) =>
    callback(event),
  );

  useEffect(() => {
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);
}
