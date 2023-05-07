import {
	UseFormRegister,
	FieldValues,
	Path,
	RegisterOptions,
	DeepMap,
	FieldError,
	FieldName,
	get,
} from 'react-hook-form';
import { Input, type InputProps, InputSize } from './Input';
import { ErrorMessage, FieldValuesFromFieldErrors } from '@hookform/error-message';
import classNames from 'classnames';

const errorSizeMap: { [key in InputSize]: string } = {
	sm: 'mt-2',
	md: 'mt-3',
	lg: 'mt-4',
};

export type FormInputProps<TFormValues> = {
	name: Path<TFormValues>;
	register?: UseFormRegister<TFormValues & FieldValues>;
	rules?: RegisterOptions;
	errors?: Partial<DeepMap<TFormValues, FieldError>>;
	showErrorMessage?: boolean;
} & Omit<InputProps, 'name'>;

export const FormInput = <TFormValues extends FieldValues>({
	className,
	name,
	rules,
	register,
	errors = {},
	size = 'md',
	showErrorMessage = true,
	...props
}: FormInputProps<TFormValues>): JSX.Element => {
	const errorMessages: unknown = get(errors, name);
	const hasError = !!(errors && errorMessages);

	return (
		<div className={className} aria-live="polite">
			<Input
				aria-invalid={hasError}
				name={name}
				size={size}
				{...props}
				{...(register && register(name))}
				className={classNames(
					{
						'transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 border-red-500 hover:border-red-500 focus:border-red-500 focus:ring-red-500':
							hasError,
					},
					['shadow font-roboto']
				)}
			/>
			<ErrorMessage
				errors={showErrorMessage ? errors : {}}
				name={
					name as unknown as FieldName<FieldValuesFromFieldErrors<Partial<DeepMap<TFormValues, FieldError>>>>
				}
				render={({ message }) => (
					<p className={classNames(['text-red-500 text-sm', errorSizeMap[size]])}>{message}</p>
				)}
			/>
		</div>
	);
};
