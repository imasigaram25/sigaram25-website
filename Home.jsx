import React from 'react';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Events from '@/components/Events';
import Members from '@/components/Members';
import Contact from '@/components/Contact';

const Home = () => {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Events />
      <Members />
      <Contact />
    </>
  );
};

export default Home;