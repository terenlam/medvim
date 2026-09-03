import { render, screen } from "@testing-library/react";
import Page from "../app/page";

describe("Page", () => {
  it("renders a first level heading titled 'Medvim'", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { level: 1, name: "Medvim" })).toBeDefined();
  });
});
