import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { zodGameId, zodPlayerName } from '@packages/zod-data-types';
import { trpc } from '../trpc';
import { toast } from 'react-toastify';

const formSchema = z
    .object({
        name: zodPlayerName,
        gameId: zodGameId
            .optional()
            .or(z.literal('')),
    });

type FormSchemaType = z.infer<typeof formSchema>;

export function Index() {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
    });
    const watchGameId = watch('gameId');

    const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
        const { name, gameId } = data;
        if (gameId) {
            await JoinGame(name, gameId);
            return;
        }
        await CreateGame(name);
    };

    async function JoinGame(name: string, gameId: string) {
        const response = await trpc.joinGame.mutate({ gameId, name });
        if ('message' in response) {
            toast.error(response.message);
            return;
        }

        if ('name' in response && 'gameId' in response) {
            navigate(`/${response.gameId}/${response.name}`);
            return;
        }
    }

    async function CreateGame(name: string) {
        const response = await trpc.createGame.mutate({ name });
        if ('name' in response && 'gameId' in response) {
            navigate(`/${response.gameId}/${response.name}`);
            return;
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label htmlFor="name">Name:
                        <input type='text' {...register('name')}></input>
                        {errors.name && (
                            <div>{errors.name.message}</div>
                        )}
                    </label>
                </div>
                <div>
                    <label htmlFor="gameId">Code:
                        <input type='text' {...register('gameId')}></input>
                        {errors.gameId && (
                            <div>{errors.gameId.message}</div>
                        )}
                    </label>
                </div>
                <button type='submit' disabled={isSubmitting}>{watchGameId ? 'Join' : 'Create'}</button>
            </form>
        </div>
    );
}