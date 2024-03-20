import Lottie from 'lottie-react';
import relaxAnimation from '../assets/lottie/relax.json';

const style = {
  height: 400,
};

const LoadingAnimation = () => {
  return <Lottie animationData={relaxAnimation} style={style} />;
};

export default LoadingAnimation;
