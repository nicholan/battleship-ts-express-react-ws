import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z
    .object({
        playerName: z
            .string()
            .min(1, 'Name is required.')
            .max(20, 'Name must be less than 20 characters.')
            .trim(),
        gameId: z
            .string()
            .optional()
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

        if (!playerName) return;
        if (gameId) {
            await JoinGame(playerName, gameId);
            return;
        }
        await CreateGame(playerName);
        return;
    };

    async function JoinGame(playerName: string, gameId: string) {
        const response = await fetch('http://localhost:3000/join', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerName, gameId })
        });

        if (response.status === 200) {
            navigate(`/${gameId}/${playerName}`);
            return;
        }

        const { message } = await response.json();
        if (message) {
            setError('root.api', { type: 'custom', message: message });
        }
    }

    async function CreateGame(playerName: string) {
        const response = await fetch('http://localhost:3000/create', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerName })
        });
        const res = await response.json();

        if (res && typeof res === 'object' && 'gameId' in res && typeof res.gameId === 'string') {
            navigate(`/${res.gameId}/${playerName}`);
            return;
        }

        const { message } = res;
        if (message && typeof message === 'string') {
            setError('root.api', { type: 'custom', message: message });
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor="playerName">Name:
                    <input type='text' {...register('playerName')}></input>
                    {errors.playerName && (
                        <div>{errors.playerName.message}</div>
                    )}
                </label>
                <label htmlFor="gameId">Code:
                    <input type='text' {...register('gameId')}></input>
                    {errors.gameId && (
                        <div>{errors.gameId.message}</div>
                    )}
                </label>
                <button type='submit' disabled={isSubmitting}>{watchGameId ? 'Join' : 'Create'}</button>
            </form>
            {errors.root && (
                <div>{errors.root.api.message}</div>
            )}
        </div>
    );
}