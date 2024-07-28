import { fireEvent, render } from "@testing-library/react";
import { vi } from "vitest";
import { Modal } from "./Modal";

describe("Modal", () => {
	it("renders children when visible prop is true", () => {
		const { getByText } = render(
			<Modal isVisible={true}>
				<div>This is a test modal</div>
			</Modal>,
		);
		expect(getByText("This is a test modal")).toBeInTheDocument();
	});

	it("does not render children when visible prop is false", () => {
		const { queryByText } = render(
			<Modal isVisible={false}>
				<div>This is a test modal</div>
			</Modal>,
		);
		expect(queryByText("This is a test modal")).not.toBeInTheDocument();
	});

	it("calls onClose when close button is clicked", () => {
		const handleClose = vi.fn();
		const { getByLabelText } = render(
			<Modal onClose={handleClose} isVisible={true}>
				<div>This is a test modal</div>
			</Modal>,
		);
		fireEvent.click(getByLabelText("Close modal"));
		expect(handleClose).toHaveBeenCalled();
	});

	it("does not render children after close button is clicked", () => {
		const handleClose = vi.fn();
		const { getByLabelText, queryByText, getByText } = render(
			<Modal onClose={handleClose} isVisible={true}>
				<div>This is a test modal</div>
			</Modal>,
		);

		expect(getByText("This is a test modal")).toBeInTheDocument();

		fireEvent.click(getByLabelText("Close modal"));
		expect(queryByText("This is a test modal")).not.toBeInTheDocument();
	});
});
