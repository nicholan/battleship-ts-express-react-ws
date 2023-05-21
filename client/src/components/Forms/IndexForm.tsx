import { z } from 'zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { zodGameId, zodPlayerName } from '@packages/zod-data-types';
import { Button } from '../Buttons/Button.js';
import { FormInput } from '../Inputs/FormInput.js';
import { Label } from '../Inputs/Label.js';
import { useEffect } from 'react';
import classNames from 'classnames';

export type IndexFormSchema = z.infer<typeof formSchema>;

const formSchema = z.object({
	name: zodPlayerName,
	gameId: zodGameId.optional().or(z.literal('')),
	isComputer: z.boolean(),
});

type IndexFormProps = {
	onSubmit: SubmitHandler<IndexFormSchema>;
	setName: (name: string) => void;
	suffix: string;
};

export function IndexForm({ onSubmit, setName, suffix }: IndexFormProps) {
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isValid },
	} = useForm<IndexFormSchema>({
		resolver: zodResolver(formSchema),
	});

	const watchGameId = watch('gameId');
	const watchName = watch('name');
	const watchAi = watch('isComputer');

	useEffect(() => {
		if (!isValid) return;
		setName(watchName);
	}, [watchName]);

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className={classNames(
				['font-roboto text-center'],
				['flex flex-col gap-4 items-center'],
				['w-full max-w-md mt-4 mx-auto'],
				['py-8 lg:py-12 px-8'],
				['rounded border dark:border-neutral-300/10'],
				['shadow-sm dark:shadow-inner'],
				['bg-neutral-50 dark:bg-neutral-800/5']
			)}
		>
			<div>
				<Label htmlFor="name">Name</Label>
				<FormInput<IndexFormSchema>
					id="name"
					type="text"
					name="name"
					label="Player name"
					register={register}
					errors={errors}
				/>
			</div>

			<div>
				<Label htmlFor="gameId">Code</Label>
				<FormInput<IndexFormSchema>
					id="gameId"
					type="text"
					name="gameId"
					label="Join code"
					register={register}
					errors={errors}
				/>
			</div>

			<div className="flex flex-row gap-2 items-center">
				<Label htmlFor="isComputer">Play against AI</Label>
				<FormInput<IndexFormSchema>
					id="isComputer"
					type="checkbox"
					name="isComputer"
					label="Play against AI"
					register={register}
					errors={errors}
				/>
			</div>
			<Button type="submit">{watchGameId ? 'Join' : 'Create'}</Button>
			{isValid && watchName && !watchAi && !watchGameId && (
				<div
					className={classNames(
						['w-full pt-8'],
						['rounded-sm border-t dark:border-neutral-300/10'],
						['dark:text-white']
					)}
				>
					<Label>Public name</Label>
					<p>
						{watchName.slice(0, 19)}
						{suffix}
					</p>
				</div>
			)}
		</form>
	);
}
