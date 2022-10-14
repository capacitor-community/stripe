import { Capacitor } from '@capacitor/core';
import { defineCustomElements } from '@stripe-elements/stripe-elements/loader';
import type { FC, PropsWithChildren, ReactNode } from "react";
import React, { createContext, useContext, useEffect, useState } from "react";

import type { StripePlugin, StripeInitializationOptions, CapacitorStripeContext } from '../index';
import { Stripe } from '../index';

const StripeContext = createContext<CapacitorStripeContext>({
    stripe: undefined as any,
    isApplePayAvailable: false,
    isGooglePayAvailable: false,
})

export const useCapacitorStripe = (): CapacitorStripeContext => {
    return useContext(StripeContext)
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
    const [isApplePayAvailable, setApplePayAvailableStatus] = useState(false)
    const [isGooglePayAvailable, setGooglePayAvailableStatus] = useState(false)
    useEffect(() => {
        const prom = Capacitor.isNativePlatform() ? Promise.resolve() : defineCustomElements()
        prom.then(() => {
            if (!initializeOptions.publishableKey) return
            Stripe.initialize(initializeOptions)
                .then(() => {
                    return Stripe.isApplePayAvailable().then(() => {
                        setApplePayAvailableStatus(true)
                    }).catch(() => {
                        setApplePayAvailableStatus(false)
                    })
                })
                .then(() => {
                    return Stripe.isGooglePayAvailable().then(() => {
                        setGooglePayAvailableStatus(true)
                    }).catch(() => {
                        setGooglePayAvailableStatus(false)
                    })
                })
                .then(() => {
                    setStripe(Stripe)
                })
        });
    }, [initializeOptions, setApplePayAvailableStatus])
    if (!stripe) {
        if (fallback) return <>{fallback}</>
        return null;
    }
    return (
        <StripeContext.Provider value={{
            stripe,
            isGooglePayAvailable,
            isApplePayAvailable,
        }}>
            {children}
        </StripeContext.Provider>
    )
}
