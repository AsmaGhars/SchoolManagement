import Navbar from '../components/Navbar';
import Image from 'next/image';

const Hero = () => {
  return (
    <div className="relative w-full min-h-screen lg:min-h-[100vh] bg-cover bg-center text-white">
      <Navbar />

      <div 
        className="flex flex-col items-center justify-center h-full text-center" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(8,0,58,0.7), rgba(8,0,58,0.7)), url("/students6.jpg")',
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          backgroundRepeat: 'no-repeat',  
          width: '100%',
          minHeight: '100vh', 
        }}
      >
      </div>
    </div>
  );
};

export default Hero;
