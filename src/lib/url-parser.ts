import type { ParsedChannelInput } from "@/types";

const CHANNEL_ID_REGEX = /^UC[\w-]{22}$/;

export function parseChannelInput(raw: string): ParsedChannelInput {
  const input = raw.trim();

  if (!input) {
    throw new Error("Please enter a YouTube channel URL or handle");
  }

  // Bare handle: @mkbhd
  if (input.startsWith("@") && !input.includes("/")) {
    const handle = input.slice(1);
    if (!handle) throw new Error("Handle cannot be empty");
    return { type: "handle", value: handle };
  }

  // Bare channel ID: UC_x5XG1OV2P6uZZ5FSM9Ttw
  if (CHANNEL_ID_REGEX.test(input)) {
    return { type: "direct_id", value: input };
  }

  // Must be a URL from here
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error(
      "Could not parse input. Enter a YouTube channel URL, @handle, or channel ID"
    );
  }

  const hostname = url.hostname.replace(/^(www\.|m\.)/, "");

  // youtu.be is always a video short link
  if (hostname === "youtu.be") {
    throw new Error("Please enter a channel URL, not a video link");
  }

  // Non-YouTube domains
  if (hostname !== "youtube.com") {
    throw new Error("Only YouTube channel URLs are supported");
  }

  const pathSegments = url.pathname
    .split("/")
    .filter(Boolean);

  // /watch → video URL
  if (pathSegments[0] === "watch") {
    throw new Error("Please enter a channel URL, not a video link");
  }

  // /shorts/ → video URL
  if (pathSegments[0] === "shorts") {
    throw new Error("Please enter a channel URL, not a video link");
  }

  // /playlist → playlist URL
  if (pathSegments[0] === "playlist") {
    throw new Error("Please enter a channel URL, not a playlist link");
  }

  // /channel/UC...
  if (pathSegments[0] === "channel" && pathSegments[1]) {
    return { type: "channel_id", value: pathSegments[1] };
  }

  // /@handle
  if (pathSegments[0]?.startsWith("@")) {
    const handle = pathSegments[0].slice(1);
    if (!handle) throw new Error("Handle cannot be empty");
    return { type: "handle", value: handle };
  }

  // /user/Username
  if (pathSegments[0] === "user" && pathSegments[1]) {
    return { type: "username", value: pathSegments[1] };
  }

  // /c/VanityName
  if (pathSegments[0] === "c" && pathSegments[1]) {
    return { type: "vanity", value: pathSegments[1] };
  }

  throw new Error(
    "Could not parse input. Enter a YouTube channel URL, @handle, or channel ID"
  );
}
