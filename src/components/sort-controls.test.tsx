import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SortControls } from "./sort-controls";

describe("SortControls", () => {
  const defaultProps = {
    sortKey: "views" as const,
    sortDirection: "desc" as const,
    onSortKeyChange: vi.fn(),
    onSortDirectionToggle: vi.fn(),
  };

  it("renders select with correct value", () => {
    render(<SortControls {...defaultProps} />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("views");
  });

  it("renders all sort options", () => {
    render(<SortControls {...defaultProps} />);
    expect(screen.getByText("Views")).toBeInTheDocument();
    expect(screen.getByText("Likes")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Engagement")).toBeInTheDocument();
  });

  it("calls onSortKeyChange when selection changes", () => {
    render(<SortControls {...defaultProps} />);
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "engagement" },
    });
    expect(defaultProps.onSortKeyChange).toHaveBeenCalledWith("engagement");
  });

  it("calls onSortDirectionToggle when button clicked", () => {
    render(<SortControls {...defaultProps} />);
    fireEvent.click(screen.getByRole("button"));
    expect(defaultProps.onSortDirectionToggle).toHaveBeenCalled();
  });
});
