import { render } from '@testing-library/react';
import { Nametag } from './Nametag';

describe('Nametag', () => {
	it('renders with a default "Player" label when no children are passed in', () => {
		const { getByText } = render(<Nametag active={true} />);
		expect(getByText(/player/i)).toBeInTheDocument();
	});

	it('renders with custom label when children are passed in', () => {
		const name = 'John Doe';
		const { getByText } = render(<Nametag active={true}>{name}</Nametag>);
		expect(getByText(name)).toBeInTheDocument();
	});

	it('applies additional classNames passed in as props', () => {
		const className = 'test-class-name';
		const { container } = render(<Nametag active={true} className={className} />);
		expect(container.firstChild).toHaveClass(className);
	});
});
