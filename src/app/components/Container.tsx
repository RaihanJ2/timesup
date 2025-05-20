import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({ children, className = "" }) => {
  return (
    <section className="container w-full h-[80vh] flex justify-center items-center">
      <div
        className={`w-2/4 h-3/4 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-800 ${className}`}
      >
        {children}
      </div>
    </section>
  );
};

export default Container;
