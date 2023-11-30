import {FC, useEffect, useRef} from "react";
import Lottie, {LottieRefCurrentProps} from "lottie-react";

interface LottieProps {
    animationData: unknown;
    initialSegment?: [number, number];
}

const LottieAnimation: FC<LottieProps> = ({animationData, initialSegment}) => {
    const lottie = useRef<LottieRefCurrentProps | null>(null);
    useEffect(() => {
        lottie.current?.goToAndPlay(0);
    }, []);

    return <Lottie
        onClick={() => {
            if (lottie.current?.animationItem?.isPaused) lottie.current.goToAndPlay(0);
        }}
        lottieRef={lottie} style={{width: '50%'}}
        initialSegment={initialSegment}
        animationData={animationData}
        autoplay={false}
        loop={false}
    />;
}

export default LottieAnimation;