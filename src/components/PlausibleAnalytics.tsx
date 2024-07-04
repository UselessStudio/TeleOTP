import {createContext, FC, PropsWithChildren, useEffect, useMemo} from "react";
import Plausible from "plausible-tracker";
import {EventOptions} from "plausible-tracker/src/lib/request.ts";
import {PlausibleOptions} from "plausible-tracker/src/lib/tracker.ts";

export interface PlausibleAnalytics {
    trackEvent: (
        eventName: string,
        options?: EventOptions,
        eventData?: PlausibleOptions
    ) => void;
}
export const PlausibleAnalyticsContext = createContext<PlausibleAnalytics | null>(null);

export interface PlausibleAnalyticsProps {
    domain: string;
    apiHost: string;
}

export const PlausibleAnalyticsProvider: FC<PropsWithChildren<PlausibleAnalyticsProps>> = ({children, domain, apiHost}) => {
    const plausible = useMemo(() => {
        return Plausible({
            domain,
            apiHost
        })
    }, [domain, apiHost]);

    useEffect(() => {
        plausible.enableAutoPageviews();
    }, [plausible]);

    return <PlausibleAnalyticsContext.Provider value={plausible}>
        {children}
    </PlausibleAnalyticsContext.Provider>
};
