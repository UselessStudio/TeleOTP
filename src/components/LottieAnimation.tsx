import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { type FC, useEffect, useRef, useState } from "react";

const animationCache = new Map<string, Promise<unknown>>();

function loadAnimation(url: string): Promise<unknown> {
    const cachedAnimation = animationCache.get(url);
    if (cachedAnimation) return cachedAnimation;

    const animation = fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    `Failed to load Lottie animation: ${response.status} ${response.statusText}`,
                );
            }
            return response.json() as Promise<unknown>;
        })
        .catch((error: unknown) => {
            animationCache.delete(url);
            throw error;
        });
    animationCache.set(url, animation);
    return animation;
}

interface LottieProps {
    animationData: string;
    initialSegment?: [number, number];
    loop?: boolean;
    speed?: number;
}

const LottieAnimation: FC<LottieProps> = ({
    animationData,
    initialSegment,
    loop,
    speed,
}) => {
    const lottie = useRef<LottieRefCurrentProps | null>(null);
    const [loadedAnimation, setLoadedAnimation] = useState<unknown>();

    useEffect(() => {
        let active = true;
        loadAnimation(animationData)
            .then((animation) => {
                if (active) setLoadedAnimation(animation);
            })
            .catch((error: unknown) => {
                console.error(error);
            });

        return () => {
            active = false;
        };
    }, [animationData]);

    useEffect(() => {
        if (!loadedAnimation) return;
        if (loop === false) {
            lottie.current?.goToAndStop(0);
        } else if (loop === true) {
            lottie.current?.goToAndPlay(0);
        }
    }, [loadedAnimation, loop]);
    useEffect(() => {
        if (!loadedAnimation) return;
        lottie.current?.goToAndPlay(0);
    }, [loadedAnimation]);
    useEffect(() => {
        if (!loadedAnimation) return;
        if (speed) lottie.current?.setSpeed(speed);
    }, [loadedAnimation, speed]);

    if (!loadedAnimation) return null;

    return (
        <Lottie
            onClick={() => {
                if (lottie.current?.animationItem?.isPaused)
                    lottie.current.goToAndPlay(0);
            }}
            lottieRef={lottie}
            style={{ width: "50%" }}
            initialSegment={initialSegment}
            animationData={loadedAnimation}
            autoplay={false}
            loop={loop ?? false}
        />
    );
};

export default LottieAnimation;
