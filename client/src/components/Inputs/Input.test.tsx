import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input, type InputProps } from './Input';

describe('Input', () => {
	const baseProps: InputProps = {
		id: 'test-id',
		name: 'test-name',
		label: 'Test Label',
		placeholder: 'Test Placeholder',
		onChange: jest.fn(),
	};

	it('should render with provided props', () => {
		render(<Input {...baseProps} />);
		const inputElement = screen.getByLabelText(/Test Label/i);
		expect(inputElement).toBeInTheDocument();
		expect(inputElement).toHaveAttribute('placeholder', 'Test Placeholder');
	});

	it('should call onChange handler when entered text changes', async () => {
		render(<Input {...baseProps} />);
		const inputElement = screen.getByLabelText(/Test Label/i);
		await userEvent.type(inputElement, 'Testing');
		expect(baseProps.onChange).toHaveBeenCalledTimes(7);
	});

	it('should render as text input if "type" prop is set to "text"', () => {
		render(<Input {...baseProps} type="text" />);
		const inputElement = screen.getByLabelText(/Test Label/i);
		expect(inputElement).toHaveAttribute('type', 'text');
	});

	it('should render as a checkbox if "type" prop is set to "checkbox"', () => {
		render(<Input {...baseProps} type="checkbox" />);
		const inputElement = screen.getByLabelText(/Test Label/i);
		expect(inputElement).toHaveAttribute('type', 'checkbox');
	});
});
