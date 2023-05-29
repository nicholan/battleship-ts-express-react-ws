import { render } from '@testing-library/react';
import { CoordinatesBar } from './CoordinatesBar';

describe('CoordinatesBar', () => {
	it('renders only numbers when type prop is "num"', () => {
		const { getByText, queryByText } = render(<CoordinatesBar type="num" />);
		expect(getByText('1')).toBeInTheDocument();
		expect(getByText('10')).toBeInTheDocument();
		expect(queryByText('A')).not.toBeInTheDocument();
	});

	it('renders only letters when type prop is "letter"', () => {
		const { getByText, queryByText } = render(<CoordinatesBar type="letter" />);
		expect(getByText('A')).toBeInTheDocument();
		expect(getByText('J')).toBeInTheDocument();
		expect(queryByText('1')).not.toBeInTheDocument();
	});

	it('applies additional classNames passed in as props', () => {
		const className = 'test-class-name';
		const { container } = render(<CoordinatesBar type="num" className={className} />);
		expect(container.firstChild).toHaveClass(className);
	});
});
