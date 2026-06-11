'use client';

import React from 'react';
import { DesktopExplorer } from './components/DesktopExplorer';
import { MobileExplorer } from './components/MobileExplorer';

export default function ExplorerPage() {
  return (
    <>
      <DesktopExplorer className="hidden md:block" />
      <MobileExplorer className="block md:hidden h-[calc(100vh-100px)]" />
    </>
  );
}
