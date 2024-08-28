import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Link as ScrollLink } from 'react-scroll';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../../public/logo6.png';
import menuIcon from '../../public/menu-icon.png';

const Navbar = () => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setMobileMenu(!mobileMenu);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLoginOrSignupPage = router.pathname === '/login' || router.pathname === '/signup' || router.pathname === '/forgot-password';

  return (
    <nav 
      className={`w-full fixed top-0 left-0 z-10 flex items-center justify-between p-4 transition duration-300 ${isLoginOrSignupPage ? 'bg-blue-800' : (isScrolled ? 'bg-blue-800' : 'bg-transparent')}`}
    >
      <Image src={logo} alt="Logo" className="w-custom-logo filter brightness-0 invert" />
      <ul className={`fixed top-0 right-0 bottom-0 transition-transform duration-500 transform ${mobileMenu ? 'translate-x-0' : 'translate-x-full'} md:static md:flex md:bg-transparent md:translate-x-0`}>
        {!isLoginOrSignupPage && (
          <>
            <li className={`list-none my-6 md:my-0 md:mx-4`}>
              <Link href="/" className={`transition duration-300 ${isScrolled || isLoginOrSignupPage ? 'text-white' : 'text-white'} cursor-pointer`}>
                Home
              </Link>
            </li>
            <li className={`list-none my-6 md:my-0 md:mx-4`}>
              <ScrollLink to="program" smooth={true} offset={-350} duration={500} className={`transition duration-300 ${isScrolled || isLoginOrSignupPage ? 'text-white' : 'text-white'} cursor-pointer`}>
                Program
              </ScrollLink>
            </li>
            <li className={`list-none my-6 md:my-0 md:mx-4`}>
              <ScrollLink to="about" smooth={true} offset={-350} duration={500} className={`transition duration-300 ${isScrolled || isLoginOrSignupPage ? 'text-white' : 'text-white'} cursor-pointer`}>
                About us
              </ScrollLink>
            </li>
            <li className={`list-none my-6 md:my-0 md:mx-4`}>
              <Link href="/login" className={`transition duration-300 ${isScrolled || isLoginOrSignupPage ? 'text-white' : 'text-white'} cursor-pointer`}>
                Login
              </Link>
            </li>
            <li className={`list-none my-6 md:my-0 md:mx-4`}>
              <Link href="/signup" className={`transition duration-300 ${isScrolled || isLoginOrSignupPage ? 'text-white' : 'text-white'} cursor-pointer`}>
                SignUp
              </Link>
            </li>
            <li className={`list-none my-6 md:my-0 md:mx-4`}>
              <ScrollLink to="contact" smooth={true} offset={-350} duration={500} className="px-6 py-2 rounded-full bg-white text-blue-800 cursor-pointer">
                Contact us
              </ScrollLink>
            </li>
          </>
        )}
        {(router.pathname === '/login' || router.pathname === '/signup') && (
          <>
            <li className={`list-none my-6 md:my-0 md:mx-4`}>
              <Link href="/" className={`transition duration-300 text-white cursor-pointer`}>
                Home
              </Link>
            </li>
            <li className={`list-none my-6 md:my-0 md:mx-4`}>
              <Link href="/login" className={`transition duration-300 text-white cursor-pointer`}>
                Login
              </Link>
            </li>
            <li className={`list-none my-6 md:my-0 md:mx-4`}>
              <Link href="/signup" className={`transition duration-300 text-white cursor-pointer`}>
                Sign Up
              </Link>
            </li>
          </>
        )}
      </ul>
      <Image src={menuIcon} alt="Menu Icon" className={`w-8 cursor-pointer md:hidden filter brightness-0 invert ${isLoginOrSignupPage ? 'hidden' : ''}`} onClick={toggleMenu} />
    </nav>
  );
};

export default Navbar;
