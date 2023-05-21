import { z } from 'zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { zodPlayerName } from '@packages/zod-data-types';
import { Button } from '../Buttons/Button';
import { FormInput } from '../Inputs/FormInput';

export type InvitePlayerFormSchema = z.infer<typeof formSchema>;

const formSchema = z.object({
	name: zodPlayerName,
});

type InvitePlayerFormProps = {
	invitePlayer?: (name: string) => void;
	closeModal?: () => void;
};

export function InvitePlayerForm({ invitePlayer, closeModal }: InvitePlayerFormProps) {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<InvitePlayerFormSchema>({
		resolver: zodResolver(formSchema),
	});

	const onSubmit: SubmitHandler<InvitePlayerFormSchema> = (data) => {
		invitePlayer && invitePlayer(data.name);
		reset();
		closeModal && closeModal();
	};

	return (
		<div className="text-center font-bebas-neue flex flex-col gap-2">
			<p className="text-2xl tracking-wider">Invite a player</p>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="font-roboto flex-row flex gap-4 text-center w-max p-2 my-0 mx-auto shadow items-center justify-center"
			>
				<FormInput<InvitePlayerFormSchema>
					name="name"
					id="name"
					label="Player name"
					register={register}
					errors={errors}
					showErrorMessage={false}
				/>
				<Button type="submit">Send</Button>
			</form>
		</div>
	);
}
