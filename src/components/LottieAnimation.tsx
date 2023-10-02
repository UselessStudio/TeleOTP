import {FC, useRef} from "react";
import Lottie, {LottieRefCurrentProps} from "lottie-react";

interface LottieProps {
    animationData: unknown;
}

const LottieAnimation: FC<LottieProps> = ({animationData}) => {
    const lottie = useRef<LottieRefCurrentProps | null>(null);
    return <Lottie
        onClick={() => {
            if (lottie.current?.animationItem?.isPaused) lottie.current.goToAndPlay(0);
        }}
        lottieRef={lottie} style={{width: '50%'}}
        animationData={animationData}
        loop={false}
    />;
}

export default LottieAnimation;