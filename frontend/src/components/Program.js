import React from "react";
import Image from "next/image";
import program1 from "../../public/program-1.jpeg";
import program5 from "../../public/program-5.jpeg";
import program4 from "../../public/program-4.jpeg";
import program2 from "../../public/program-2.jpg";

const Programs = () => {
  return (
    <div className="program">
      <div className="container mx-auto mt-20 flex flex-col md:flex-row md:justify-between md:space-x-4 space-y-6 md:space-y-0">
      <div className="relative flex-1 p-2">
        <Image
          src={program1}
          alt="School Library"
          className="rounded-lg object-cover h-48 w-full"
        />
        <div className="absolute inset-0 bg-blue-900 bg-opacity-30 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-400">
          <p className="text-white text-lg">Headmasters</p>
        </div>
      </div>
      <div className="relative flex-1 p-2">
        <Image
          src={program5}
          alt="School Sports"
          className="rounded-lg object-cover h-48 w-full"
        />
        <div className="absolute inset-0 bg-blue-900 bg-opacity-30 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-400">
          <p className="text-white text-lg">Students</p>
        </div>
      </div>
      <div className="relative flex-1 p-2">
        <Image
          src={program4}
          alt="School Environment"
          className="rounded-lg object-cover h-48 w-full"
        />
        <div className="absolute inset-0 bg-blue-900 bg-opacity-30 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-400">
          <p className="text-white text-lg">Teachers</p>
        </div>
      </div>
      <div className="relative flex-1 p-2">
        <Image
          src={program2}
          alt="School Environment"
          className="rounded-lg object-cover h-48 w-full"
        />
        <div className="absolute inset-0 bg-blue-900 bg-opacity-30 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-400">
          <p className="text-white text-lg">Parents</p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Programs;
