import { render } from '@testing-library/react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import '@testing-library/jest-dom';
import ErrorPage from './Error';

jest.mock('react-router-dom', () => ({
	useRouteError: jest.fn(),
	isRouteErrorResponse: jest.fn(),
}));

const mockedUseRouteError = useRouteError as jest.MockedFunction<typeof useRouteError>;
const mockedIsRouteErrorResponse = isRouteErrorResponse as jest.MockedFunction<typeof isRouteErrorResponse>;

describe('ErrorPage component', () => {
	afterEach(() => {
		jest.resetAllMocks();
	});

	it('renders an error message when there is no error response', () => {
		mockedUseRouteError.mockReturnValue(undefined);
		mockedIsRouteErrorResponse.mockReturnValue(false);

		const { getByText } = render(<ErrorPage />);

		expect(getByText('Sorry, an unexpected error has occured.')).toBeInTheDocument();
	});

	it('renders an error message with status text when there is an error response', () => {
		const errorResponse = {
			statusText: 'Not Found',
		};
		mockedUseRouteError.mockReturnValue(errorResponse);
		mockedIsRouteErrorResponse.mockReturnValue(true);

		const { getByText } = render(<ErrorPage />);

		expect(getByText(errorResponse.statusText)).toBeInTheDocument();
	});
});
