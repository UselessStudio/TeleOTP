import {createContext, FC, PropsWithChildren, useEffect, useMemo} from "react";
import Plausible, {EventOptions, PlausibleOptions} from "plausible-tracker";

/**
 * PlausibleAnalytics is responsible for tracking custom event goals.
 *
 * To get an instance of PlausibleAnalytics, you should use the useContext hook:
 * @example
 * const analytics = useContext(PlausibleAnalyticsContext);
 */
export interface PlausibleAnalytics {
    /**
     * Tracks a new event.
     * @param eventName - name of the event to track
     * @param options - callback and additional event props
     * @param eventData
     */
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

/**
 * PlausibleAnalytics is created using PlausibleAnalyticsProvider component
 */
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
