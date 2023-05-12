import { z } from 'zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { zodGameId, zodPlayerName } from '@packages/zod-data-types';
import { Button } from '../Buttons/Button.js';
import { FormInput } from '../Inputs/FormInput.js';
import { Label } from '../Inputs/Label.js';
import { useEffect } from 'react';

export type IndexFormSchema = z.infer<typeof formSchema>;

const formSchema = z.object({
	name: zodPlayerName,
	gameId: zodGameId.optional().or(z.literal('')),
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

	useEffect(() => {
		if (!isValid) return;
		setName(watchName);
	}, [watchName]);

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="font-roboto flex-col gap-4 flex text-center w-full max-w-md my-0 mx-auto py-12 px-8 shadow bg-neutral-200 items-center"
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
			<Button type="submit">{watchGameId ? 'Join' : 'Create'}</Button>
			{isValid && watchName && (
				<div className="flex justify-center flex-col gap-2 py-2 px-6 bg-white shadow">
					<Label>Public name</Label>
					<div className="flex justify-center">
						<p>
							{watchName.slice(0, 19)}
							{suffix}
						</p>
					</div>
				</div>
			)}
		</form>
	);
}
