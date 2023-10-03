import {FC, useRef} from "react";
import Lottie, {LottieRefCurrentProps} from "lottie-react";

interface LottieProps {
    animationData: unknown;
    initialSegment?: [number, number];
}

const LottieAnimation: FC<LottieProps> = ({animationData, initialSegment}) => {
    const lottie = useRef<LottieRefCurrentProps | null>(null);
    return <Lottie
        onClick={() => {
            if (lottie.current?.animationItem?.isPaused) lottie.current.goToAndPlay(0);
        }}
        lottieRef={lottie} style={{width: '50%'}}
        initialSegment={initialSegment}
        animationData={animationData}
        loop={false}
    />;
}

export default LottieAnimation;