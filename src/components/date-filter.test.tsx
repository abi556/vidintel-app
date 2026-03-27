import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateFilter } from "./date-filter";

describe("DateFilter", () => {
  const defaultProps = {
    selected: "30d" as const,
    onChange: vi.fn(),
  };

  it("renders all date range options", () => {
    render(<DateFilter {...defaultProps} />);
    expect(screen.getByText("7 days")).toBeInTheDocument();
    expect(screen.getByText("30 days")).toBeInTheDocument();
    expect(screen.getByText("90 days")).toBeInTheDocument();
    expect(screen.getByText("All")).toBeInTheDocument();
  });

  it("marks selected option as checked", () => {
    render(<DateFilter {...defaultProps} />);
    expect(screen.getByText("30 days")).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("7 days")).toHaveAttribute("aria-checked", "false");
  });

  it("calls onChange when option is clicked", () => {
    render(<DateFilter {...defaultProps} />);
    fireEvent.click(screen.getByText("7 days"));
    expect(defaultProps.onChange).toHaveBeenCalledWith("7d");
  });
});
