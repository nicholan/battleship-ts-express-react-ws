import React from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { zodGameId, zodPlayerName } from '../../../server/src/trpc/zodTypes';
import { trpc } from '../trpc';

const formSchema = z
    .object({
        playerName: zodPlayerName,
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
        setError,
        formState: { errors, isSubmitting },
    } = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
    });
    const watchGameId = watch('gameId');

    const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
        const { playerName, gameId } = data;

        if (gameId) {
            await JoinGame(playerName, gameId);
            return;
        }
        await CreateGame(playerName);
    };

    async function JoinGame(name: string, gameId: string) {
        const response = await trpc.joinGame.mutate({ gameId, name });
        if ('message' in response) {
            setError('root.api', { type: 'custom', message: response.message });
            return;
        }

        if ('name' in response && 'gameId' in response) {
            navigate(`/${response.gameId}/${response.name}`);
        }
    }

    async function CreateGame(playerName: string) {
        const response = await trpc.createGame.mutate({ name: playerName });
        if ('name' in response && 'gameId' in response) {
            navigate(`/${response.gameId}/${response.name}`);
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label htmlFor="playerName">Name:
                        <input type='text' {...register('playerName')}></input>
                        {errors.playerName && (
                            <div>{errors.playerName.message}</div>
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
            {errors.root && (
                <div>{errors.root.api.message}</div>
            )}
        </div>
    );
}