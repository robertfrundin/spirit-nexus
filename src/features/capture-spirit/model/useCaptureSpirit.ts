'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { captureSpirit } from '@/src/shared/api/spirits';
import { SpiritApiResponse } from '@/src/shared/lib/zod/spirits';

function getPreviousSpiritData(
    queryClient: ReturnType<typeof useQueryClient>,
    spiritId: string,
){
    const cachedData = queryClient.getQueryData<SpiritApiResponse>(['spirits']);
    if (!cachedData) return null;

    return cachedData.data.find((spirit) => spirit.id === spiritId);
}

export function useCaptureSpirit(){
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: captureSpirit,
        onMutate: async (spiritId:string) => {
            await queryClient.cancelQueries({queryKey: ['spirits']});
            const previousData = queryClient.getQueryData<SpiritApiResponse>(['spirits']);
            const previousSpirit = getPreviousSpiritData(queryClient, spiritId);

            queryClient.setQueryData(['spirits'], (oldData: SpiritApiResponse) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    data: oldData.data.map((spirit) => spirit.id === spiritId ? { ...spirit, status: 'captured' } : spirit),
                }
            })
            return { previousData, previousSpirit };
        },
        onSuccess: (data, spiritId, context) => {
            if('error' in data){
                if(context?.previousSpirit){
                    queryClient.setQueryData(['spirits'], context.previousData);
                }
            }
        },
        onError: (error, spiritId, context) => {
            if(context?.previousSpirit){
                queryClient.setQueryData(['spirits'], context.previousData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({queryKey: ['spirits']});
        }
    })
    return mutation;
}