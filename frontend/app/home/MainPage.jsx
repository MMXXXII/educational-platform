import React from 'react';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { DetailedFeaturesSection } from './DetailedFeaturesSection';

export  function Main() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <DetailedFeaturesSection />
    </>
  );
}