import {
	ErrorMessage,
	type FieldValuesFromFieldErrors,
} from "@hookform/error-message";
import classNames from "classnames";
import {
	type DeepMap,
	type FieldError,
	type FieldName,
	type FieldValues,
	type Path,
	type RegisterOptions,
	type UseFormRegister,
	get,
} from "react-hook-form";
import { Input, type InputProps } from "./Input";

export type FormInputProps<TFormValues> = {
	name: Path<TFormValues>;
	register?: UseFormRegister<TFormValues & FieldValues>;
	rules?: RegisterOptions;
	errors?: Partial<DeepMap<TFormValues, FieldError>>;
	showErrorMessage?: boolean;
} & Omit<InputProps, "name">;

export const FormInput = <TFormValues extends FieldValues>({
	className,
	name,
	rules,
	register,
	errors = {},
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
				{...props}
				{...register?.(name)}
				className={classNames({
					"transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 border-red-500 hover:border-red-500 focus:border-red-500 focus:ring-red-500":
						hasError,
				})}
			/>
			<ErrorMessage
				errors={showErrorMessage ? errors : {}}
				name={
					name as unknown as FieldName<
						FieldValuesFromFieldErrors<
							Partial<DeepMap<TFormValues, FieldError>>
						>
					>
				}
				render={({ message }) => (
					<p
						className={classNames(
							["text-red-500 text-sm"],
							["mt-2 md:mt-3 lg:mt-4"],
						)}
					>
						{message}
					</p>
				)}
			/>
		</div>
	);
};
