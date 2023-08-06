import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormInput } from './FormInput';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { vi } from 'vitest';

type TestFormSchema = z.infer<typeof formSchema>;

const regex = /^[a-z0-9]+$/i;

const formSchema = z.object({
	testInput: z
		.string()
		.trim()
		.toLowerCase()
		.min(1, 'Input is required.')
		.max(5, 'Input must be less than 5 characters.')
		.regex(regex, 'Input may contain only letters and numbers.'),
});

type TestFormProps = {
	showErrorMessage?: boolean;
	label?: string;
	onSubmit?: () => void;
};

const TestForm = ({ showErrorMessage = true, label = 'testInput label', onSubmit = vi.fn }: TestFormProps) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<TestFormSchema>({
		resolver: zodResolver(formSchema),
	});

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<FormInput<TestFormSchema>
				name="testInput"
				id="testInput"
				label={label}
				register={register}
				errors={errors}
				showErrorMessage={showErrorMessage}
			/>
			<button type="submit">Submit</button>
		</form>
	);
};

describe('FormInput', () => {
	it('renders without errors', () => {
		render(<TestForm />);
		expect(screen.getByLabelText('testInput label')).toBeInTheDocument();
		expect(screen.getByText('Submit')).toBeInTheDocument();
	});

	describe('When showErrorMessage={true}', () => {
		beforeEach(() => {
			render(<TestForm showErrorMessage={true} />);
		});

		it('does not display error messages when input is valid', async () => {
			const input = screen.getByLabelText('testInput label');
			const submit = screen.getByText('Submit');

			await userEvent.type(input, 'validinput');
			await userEvent.click(submit);

			expect(screen.queryByText('Input may contain only letters and numbers.')).not.toBeInTheDocument();
		});

		it('displays error message when input contains other than letters or numbers', async () => {
			const input = screen.getByLabelText('testInput label');
			const submit = screen.getByText('Submit');

			await userEvent.type(input, '!');
			await userEvent.click(submit);

			expect(screen.getByText('Input may contain only letters and numbers.')).toBeInTheDocument();
		});

		it('displays error message when input is empty', async () => {
			const input = screen.getByLabelText('testInput label');
			const submit = screen.getByText('Submit');

			await userEvent.type(input, ' ');
			await userEvent.click(submit);

			expect(screen.getByText('Input is required.')).toBeInTheDocument();
		});

		it('displays error message when input is more than five characters', async () => {
			const input = screen.getByLabelText('testInput label');
			const submit = screen.getByText('Submit');

			await userEvent.type(input, 'morethanfive');
			await userEvent.click(submit);

			expect(screen.getByText('Input must be less than 5 characters.')).toBeInTheDocument();
		});
	});

	describe('When showErrorMessage={false}', () => {
		it('does not display error messages on invalid input', async () => {
			render(<TestForm showErrorMessage={false} />);
			const input = screen.getByLabelText('testInput label');
			const submit = screen.getByText('Submit');

			await userEvent.type(input, '!');
			await userEvent.click(submit);

			expect(screen.queryByText('Input may contain only letters and numbers.')).not.toBeInTheDocument();
		});
	});

	describe('Form submission', () => {
		const submitHandler = vi.fn();

		beforeEach(() => {
			vi.clearAllMocks();
			render(<TestForm onSubmit={submitHandler} />);
		});

		it('does not call onSubmit function when input is invalid', async () => {
			const input = screen.getByLabelText('testInput label');
			const submit = screen.getByText('Submit');

			await userEvent.type(input, '!');
			await userEvent.click(submit);

			expect(submitHandler).toHaveBeenCalledTimes(0);
		});

		it('calls onSubmit function when input is valid', async () => {
			const input = screen.getByLabelText('testInput label');
			const submit = screen.getByText('Submit');

			await userEvent.type(input, 'valid');
			await userEvent.click(submit);

			expect(submitHandler).toHaveBeenCalledTimes(1);
		});
	});
});
