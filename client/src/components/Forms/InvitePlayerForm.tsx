import { z } from 'zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { zodPlayerName } from '@packages/zod-data-types';
import { Button } from '../Buttons/Button.js';
import { FormInput } from '../Inputs/FormInput.js';
import classNames from 'classnames';
import { dispatchToast } from '../Toasts/Toaster.js';

export type InvitePlayerFormSchema = z.infer<typeof formSchema>;

const formSchema = z.object({
	name: zodPlayerName,
});

type InvitePlayerFormProps = {
	invitePlayer?: (name: string) => void;
	closeModal?: () => void;
	gameId: string;
};

export function InvitePlayerForm({ invitePlayer, closeModal, gameId }: InvitePlayerFormProps) {
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

	const copyToClipboard = async () => {
		await navigator.clipboard.writeText(gameId);
		dispatchToast('COPIED');
		closeModal && closeModal();
	};

	return (
		<div
			className={classNames(
				['flex flex-col justify-center items-center'],
				['text-center tracking-wide'],
				['p-0 md:px-8']
			)}
		>
			<div className={classNames(['flex flex-col gap-2 pb-4 lg:pb-6'], ['border-b dark:border-neutral-300/10'])}>
				<p className={classNames(['text-xl md:text-3xl font-bebas-neue'])}>Invite with public name</p>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="font-roboto flex-row flex gap-4 text-center my-0 mx-auto shadow items-center justify-center"
				>
					<FormInput<InvitePlayerFormSchema>
						name="name"
						id="name"
						label="Player name"
						register={register}
						errors={errors}
						showErrorMessage={false}
					/>
					<Button aria-label="Send game invitation" type="submit">
						Send
					</Button>
				</form>
			</div>
			<div className={classNames(['flex flex-col gap-2 items-center'], ['pt-4 lg:pt-6'])}>
				<p className={classNames(['text-xl md:text-3xl font-bebas-neue'])}>Or share game code</p>
				<div className={classNames(['flex flex-row gap-4 items-center'])}>
					<span
						className={classNames(
							['text-black font-roboto'],
							['bg-neutral-50 border rounded-sm shadow-inner'],
							['p-2 md:p-3']
						)}
					>
						{gameId}
					</span>
					<Button aria-label="Copy game join code" onClick={copyToClipboard}>
						Copy
					</Button>
				</div>
			</div>
		</div>
	);
}
