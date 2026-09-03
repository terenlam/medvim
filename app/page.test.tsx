import { render } from "@testing-library/react";
import Page from "../app/page";

describe("Page", () => {
  it("renders a first level heading titled 'Medvim'", () => {
    const page = render(<Page />);
    expect(page).toMatchSnapshot();
  });
});
