import React from "react";
import clsx from "clsx";
import SpinnerIcon from "../icons/spinner";

const SimpleLoader = ({ classNames = "" }) => {
  return (
    <div className={clsx("flex   justify-center items-center", classNames)}>
      <div className="animate-spin">
        <SpinnerIcon width={30} height={30} />
      </div>
    </div>
  );
};

export default SimpleLoader;
