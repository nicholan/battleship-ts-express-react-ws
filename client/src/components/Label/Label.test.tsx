import { render } from "@testing-library/react";
import { Label } from "./Label";

describe("Label", () => {
	it("renders the label with provided children", () => {
		const labelText = "Label for a name";
		const { getByText } = render(<Label>{labelText}</Label>);
		expect(getByText(labelText)).toBeInTheDocument();
	});

	it("applies additional classNames passed in as props", () => {
		const className = "test-class-name";
		const { container } = render(
			<Label className={className}>Label Text</Label>,
		);
		expect(container.firstChild).toHaveClass(className);
	});
});
