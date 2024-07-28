import { render } from "@testing-library/react";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
	it("renders with children", () => {
		const tooltipText = "Tooltip text here";
		const position = "top";

		const { getByText } = render(
			<Tooltip tooltipText={tooltipText} position={position}>
				<button type="button">Click Me</button>
			</Tooltip>,
		);

		expect(getByText("Click Me")).toBeInTheDocument();
	});

	it("renders tooltipText", () => {
		const tooltipText = "This is a tooltip";
		const position = "top";

		const { getByText } = render(
			<Tooltip tooltipText={tooltipText} position={position}>
				<button type="button">Click Me</button>
			</Tooltip>,
		);
		expect(getByText(tooltipText)).toBeInTheDocument();
	});
});
