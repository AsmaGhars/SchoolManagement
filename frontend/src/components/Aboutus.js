import Image from 'next/image';
import about_img from '../../public/aboutus.jpeg';

const Aboutus = ({ setPlayState }) => {
  return (
    <div className="about">
      <div className="my-24 flex flex-col lg:flex-row items-center justify-between mx-auto w-11/12">
      <div className="relative lg:flex-shrink-0 w-full lg:w-1/3 mb-8 lg:mb-0">
        <Image src={about_img} alt="About School" className="w-full rounded-lg" />
      </div>
      <div className="lg:w-2/3 lg:ml-8">
        <p className="text-gray-600 mb-4">MySchool is a modern school management platform built for private schools. Our aim is to make managing school activities easier and more efficient.</p>
        <p className="text-gray-600 mb-4">MySchool helps schools handle student and teacher records, schedules, grades, and finances all in one place. We also make it simple for parents, teachers, and administrators to communicate.</p>
        <p className="text-gray-600 mb-4">Our platform supports private schools in providing the best education and smooth administration.</p>
      </div>
    </div>
    </div>
  );
}

export default Aboutus;
