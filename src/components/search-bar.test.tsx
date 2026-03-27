import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "./search-bar";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("SearchBar", () => {
  beforeEach(() => {
    mockPush.mockReset();
    vi.restoreAllMocks();
  });

  it("renders input and analyze button", () => {
    render(<SearchBar />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /analyze/i })).toBeInTheDocument();
  });

  it("shows error when submitting empty input", async () => {
    render(<SearchBar />);
    fireEvent.click(screen.getByRole("button", { name: /analyze/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /paste a youtube/i
    );
  });

  it("navigates to /channel/[id] on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ channelId: "UCtest123" }),
    });

    render(<SearchBar />);
    const user = userEvent.setup();

    await user.type(screen.getByRole("textbox"), "@mkbhd");
    await user.click(screen.getByRole("button", { name: /analyze/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/channel/UCtest123");
    });
  });

  it("shows API error message on failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({
          code: "CHANNEL_NOT_FOUND",
          message: "Channel not found. Double-check the URL.",
        }),
    });

    render(<SearchBar />);
    const user = userEvent.setup();

    await user.type(screen.getByRole("textbox"), "@nonexistent");
    await user.click(screen.getByRole("button", { name: /analyze/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /channel not found/i
    );
  });

  it("shows network error on fetch failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("fetch failed"));

    render(<SearchBar />);
    const user = userEvent.setup();

    await user.type(screen.getByRole("textbox"), "@mkbhd");
    await user.click(screen.getByRole("button", { name: /analyze/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /something went wrong/i
    );
  });

  it("clears error when user types", async () => {
    render(<SearchBar />);
    const user = userEvent.setup();

    fireEvent.click(screen.getByRole("button", { name: /analyze/i }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox"), "a");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows supported formats hint", () => {
    render(<SearchBar />);
    expect(screen.getByText(/supports channel urls/i)).toBeInTheDocument();
  });
});
