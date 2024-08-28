import React from 'react';

const Title = ({ subTitle, title }) => {
  return (
    <div className="text-center text-blue-800 font-semibold text-xs uppercase my-16">
      <p className="text-base">{subTitle}</p>
      <h2 className="text-3xl text-gray-900 mt-1">{title}</h2>
    </div>
  );
};

export default Title;
