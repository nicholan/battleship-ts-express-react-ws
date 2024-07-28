import { render } from "@testing-library/react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { type MockedFunction, vi } from "vitest";
import ErrorPage from "./Error";

type MockedUseRouteError = MockedFunction<typeof useRouteError>;
type MockedIsRouteErrorResponse = MockedFunction<typeof isRouteErrorResponse>;

vi.mock("react-router-dom", () => ({
	useRouteError: vi.fn(),
	isRouteErrorResponse: vi.fn(),
}));

const mockedUseRouteError = useRouteError as MockedUseRouteError;
const mockedIsRouteErrorResponse =
	isRouteErrorResponse as unknown as MockedIsRouteErrorResponse;

describe("ErrorPage component", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("renders an error message when there is no error response", () => {
		mockedUseRouteError.mockReturnValue(undefined);
		mockedIsRouteErrorResponse.mockReturnValue(false);

		const { getByText } = render(<ErrorPage />);

		expect(
			getByText("Sorry, an unexpected error has occured."),
		).toBeInTheDocument();
	});

	it("renders an error message with status text when there is an error response", () => {
		const errorResponse = {
			statusText: "Not Found",
		};
		mockedUseRouteError.mockReturnValue(errorResponse);
		mockedIsRouteErrorResponse.mockReturnValue(true);

		const { getByText } = render(<ErrorPage />);

		expect(getByText(errorResponse.statusText)).toBeInTheDocument();
	});
});
