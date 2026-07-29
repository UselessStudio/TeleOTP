import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { type FC, useEffect, useRef } from "react";

interface LottieProps {
    animationData: unknown;
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
    useEffect(() => {
        if (loop === false) {
            lottie.current?.goToAndStop(0);
        } else if (loop === true) {
            lottie.current?.goToAndPlay(0);
        }
    }, [loop]);
    useEffect(() => {
        lottie.current?.goToAndPlay(0);
    }, []);
    useEffect(() => {
        if (speed) lottie.current?.setSpeed(speed);
    }, [speed]);

    return (
        <Lottie
            onClick={() => {
                if (lottie.current?.animationItem?.isPaused)
                    lottie.current.goToAndPlay(0);
            }}
            lottieRef={lottie}
            style={{ width: "50%" }}
            initialSegment={initialSegment}
            animationData={animationData}
            autoplay={false}
            loop={loop ?? false}
        />
    );
};

export default LottieAnimation;
