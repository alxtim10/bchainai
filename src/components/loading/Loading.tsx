import Lottie from "lottie-react";
import animationData from '../../constants/loading.json'

const Loading = () => {
  return (
    <div className="flex items-start w-20 -ml-7 -mt-9">
      <Lottie animationData={animationData} loop autoplay />
    </div>
  );
};

export default Loading;
