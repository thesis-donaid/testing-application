'use client'
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image'
import Link from 'next/link'
import PUBLIC_LINK from '@/constants/public-links';
import useScrollDirection from '@/hooks/useScrollDirection';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Heart, CircleUser } from 'lucide-react'
import { SessionData } from '@/types/session';


export default function Header(){
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const scrollDirection = useScrollDirection();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState(false);

    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [checkingSession, setCheckingSession] = useState(true);
    
    const translateY = scrollDirection === 'down' ? -100 : 0

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll)
    }, []);

    // Check session from our system
    useEffect(() => {
        fetch('/api/auth/session-check')
            .then(res => res.json())
            .then((data: SessionData) => {
                setSessionData(data);
                setCheckingSession(false)
            })
            .catch(err => {
                console.error(err);
                setCheckingSession(false);
            })
    }, []);


    const handleClick = () => {
        setIsOpen(false);
        setActiveDropdown(null);
    }

    const toggleDropDown = (index: number) => {
        if(activeDropdown === index) {
            setActiveDropdown(null)
        } else {
            setActiveDropdown(index);
        }
    }


    const user = sessionData?.user;

    const links = PUBLIC_LINK

    return(
        <header className={`fixed flex top-0 md:top-8 left-0 right-0 z-100 transition-all duration-500 ease-out bg-white/95 backdrop-blur-md ${isScrolled ? 'shadow-lg py-2' : 'shadow-sm py-4'} border-b border-gray-100`}
        style={{ transform: `translateY(${translateY}%)`}}
        >


            <nav className='min-w-6xl mx-auto px-4 flex justify-between items-center'>
                {/* Logo */}
                <Link 
                    href="/"
                    className='flex items-center space-x-3 group hover:drop-shadow-xl'
                >
                    <div className='relative w-10 h-10 flex items-center justify-center transition-all duration-300 group-hover:scale-105'>
                        <Image
                            src="/logo.jpg"
                            fill
                            alt="PNA Logo"
                            className='w-full h-full object-cover rounded-full'
                        />
                    </div>

                    <div className='transition-all duration-300 group-hover:translate-x-1'>
                        <h1 className='text-md md:text-xl font-bold text-gray-900'>
                            Puso ng Ama Foundation
                        </h1>
                        <p className='text-xs md:text-sm text-gray-600 flex items-center'>
                            Spreading love and hope
                        </p>
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className='hidden md:flex items-center space-x-1'

                >
                    {links.map((link,index) => (
                        <div key={link.href}
                            className='relative group'
                        >
                            <Link href={link.href}
                                className={`relative px-4 py-2 rounded-lg transition-all duration-300 flex items-center ${pathname === link.href ? 'text-red-600' : 'text-gray-700'} hover:text-red-400`}

                                onMouseEnter={() => link.children && setActiveDropdown(index)}

                                onMouseLeave={() => link.children && setActiveDropdown(null)}
                                
                                onClick={() => !link.children && setActiveDropdown(index)}

                            >
                                {link.label}
                                {link.children && (
                                    <ChevronDown
                                        className={`ml-1 h-4 w-4 transition-transform duration-300 ${activeDropdown === index ? 'rotate-180' : ''}`}
                                    />
                                )}
                                {pathname === link.href && (
                                    <span className='absolute bottom-0 left-4 right-4 h-0.5 bg-red-600 rounded-full'></span>
                                )}
                                <span className='absolute inset-0 scale-0 rounded-lg bg-red-50 group-hover:scale-100 transition-transform duration-300 -z-10'></span>
                            </Link>

                            {/* Dropdown for desktop */}

                            {link.children && (
                                <div className={`absolute top-full left-0 mt-1 w-48 bg-white max-h-100 overflow-y-auto rounded-lg shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 origin-top ${activeDropdown === index ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}
                                scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-red-50 scrollbar-thumb-rounded-full hover:scrollbar-thumb-red-400
                                `}>
                                    {link.children.map((child) => (
                                        <Link key={child.href}
                                            href={child.href}
                                            className={`block px-4 py-3 transition-colors duration-300 ${pathname === child.href ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-700 hover:bg-gray-50 hover:text-red-500'}`}
                                            onMouseEnter={() => setActiveDropdown(index)}

                                            onMouseLeave={() => setActiveDropdown(null)}
                                            onClick={() => setActiveDropdown(null)}
                                        >
                                            {child.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))

                    }
                    <Link 
                    href="/donation"
                    className='px-4 py-2 text-gray-700 cursor-pointer flex items-center justify-center transition-all duration-300 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5'>
                        <Heart className='text-red-700'/>
                        <span className='text-lg font-light ml-2'>Donate</span>
                    </Link>
                </div>

                {/* Mobile Toggle Button */}
                <button className='md:hidden p-2 rounded-lg hover:bg-gray-100'
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label='Toggle menu'
                >
                    {isOpen ? (
                        <X className='h-6 w-6 text-red-700 transition-transform duration-100'/>
                    ): (
                        <Menu className='h-6 w-6 text-gray-700 transition-transform duration-100'/>
                    )}
                </button>
            </nav>

            {/* Mobile Menu */}
            <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className={`px-4 pb-4 pt-2 space-y-1 overflow-y-auto max-h-full`}>
                        {links.map((link, index)=> (
                            <div key={link.href}>
                                {link.children ? (
                                    <div>

                                        <button 
                                            onClick={() => toggleDropDown(index)}
                                            className={`flex items-center justify-between w-full py-3 px-4 rounded-lg transition-all duration-300 active:text-red-600 ${pathname.startsWith(link.href) ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50 hover:text-red-500'}`}>
                                                <span>{link.label}</span>
                                                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${activeDropdown === index ? 'rotate-180' : ''}`}
                                                />
                                        </button>
                                        <div className={`pl-6 overflow-hidden transition-all duration-500 ${activeDropdown === index ? 'max-h-96' : 'max-h-0'}`}>
                                            {link.children.map((child) => (
                                                <Link 
                                                    key={child.href}
                                                    href={child.href}
                                                    onClick={handleClick}
                                                    className={`block py-3 px-4 rounded-lg transition-all duration-300 ${pathname === child.href ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-red-500'}`}
                                                >
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                ): (
                                    <Link 
                                        href={link.href}
                                        onClick={handleClick}
                                        className={`block py-3 px-4 rounded-lg transition-all duration-300 ${pathname === link.href ? 'bg-red-50 text-red-600 font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-red-500'}`}
                                    >
                                        {link.label}
                                    </Link>
                                )}

                                
                            </div>
                        ))}
                        <button className='w-full mt-2 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 font-medium shadow-md flex items-center justify-center'>
                            <Heart className='mr-2 h-5 w-5'/>
                            Donate Now
                        </button>
                    </div>
            </div>

            {user && (

                <label className="absolute right-2/25 top-1/2 -translate-y-1/2 inline-flex items-center cursor-pointer group space-x-5">
                    <span className="ml-3 text-sm font-medium text-gray-900">
                        {user?.name}
                    </span>
                    {/* Hidden Checkbox */}
                    <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={false}
                        onChange={() => false}
                    />
                    
                    {/* The Track */}
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer 
                                    peer-focus:ring-4 peer-focus:ring-blue-300 
                                    dark:peer-focus:ring-blue-800 dark:bg-gray-700 
                                    peer-checked:after:translate-x-full peer-checked:after:border-white 
                                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                    after:bg-white after:border-gray-300 after:border after:rounded-full 
                                    after:h-5 after:w-5 after:transition-all dark:border-gray-600 
                                    peer-checked:bg-blue-600">
                    </div>

            

                </label>
            )}
         

            {/* Profile */}
            <button 
                className='absolute right-5 top-1/2 -translate-y-1/2'
            >
                <CircleUser className='w-10 h-10 text-yellow-500'/>
            </button>
            

        </header>
    )
}

