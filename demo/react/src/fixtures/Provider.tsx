import { createContext, FC, PropsWithChildren, ReactNode, useContext, useEffect, useState } from "react";
import { Stripe, StripePlugin, StripeInitializationOptions } from '@capacitor-community/stripe';
import { defineCustomElements } from '@stripe-elements/stripe-elements/loader';

export type CapacitorStripe = {
    stripe: StripePlugin
}
const CapacitorStripeContext = createContext<CapacitorStripe>({} as any)

export const useCapacitorStripe = () => {
    return useContext(CapacitorStripeContext)
}
export type CapacitorStripeProviderProps = PropsWithChildren<StripeInitializationOptions & {
    fallback?: ReactNode;
}>

export const CapacitorStripeProvider :FC<CapacitorStripeProviderProps> = ({
    fallback,
    children,
    ...initializeOptions
}) => {
    const [stripe, setStripe] = useState<StripePlugin>()
    useEffect(() => {
        defineCustomElements();
        if (!initializeOptions.publishableKey) return
        Stripe.initialize(initializeOptions).then(() => {
            setStripe(Stripe)
        })
    }, [initializeOptions])
    if (!stripe) {
        if (fallback) return <>{fallback}</>
        return null;
    }
    return (
        <CapacitorStripeContext.Provider value={{
            stripe
        }}>
            {children}
        </CapacitorStripeContext.Provider>
    )
}