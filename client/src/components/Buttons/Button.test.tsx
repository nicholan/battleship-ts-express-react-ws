import { fireEvent, render } from "@testing-library/react";
import { vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
	it("renders with children", () => {
		const { getByText } = render(<Button>Click Me</Button>);
		expect(getByText("Click Me")).toBeInTheDocument();
	});

	it("applies correct styles based on props", () => {
		const { container, rerender } = render(<Button>Enabled</Button>);

		expect(container.firstChild).toHaveClass(
			"bg-gradient-to-r from-orange-400 to-orange-500",
		);
		expect(container.firstChild).not.toHaveClass("bg-neutral-700");

		rerender(<Button disabled>Disabled</Button>);
		expect(container.firstChild).not.toHaveClass(
			"bg-gradient-to-r from-orange-400 to-orange-500",
		);
		expect(container.firstChild).toHaveClass("bg-neutral-700");
	});

	it("calls onClick function when clicked", () => {
		const handleClick = vi.fn();
		const { getByText } = render(
			<Button onClick={handleClick}>Click Me</Button>,
		);
		fireEvent.click(getByText("Click Me"));
		expect(handleClick).toHaveBeenCalled();
	});

	it("renders with correct type attribute based on props", () => {
		const { getByText } = render(<Button type="submit">Submit</Button>);
		const buttonElement = getByText("Submit");

		expect(buttonElement).toHaveAttribute("type", "submit");
	});
});
