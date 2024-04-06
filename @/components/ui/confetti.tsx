import { useLayoutEffect, useState } from "react";
import Confetti from "react-confetti";

export default ({ recycle }: { recycle: boolean }) => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (width !== window.innerWidth) setWidth(window.innerWidth);
    if (height !== window.innerHeight) setHeight(window.innerHeight);
  }, [window.innerHeight, window.innerWidth]);

  return <Confetti height={height} recycle={recycle} width={width} />;
};
