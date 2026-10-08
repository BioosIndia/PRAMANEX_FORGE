import PresentationMotion from '@/components/presentation-motion';
import type {Metadata} from 'next';
import './globals.css';
import './references.css';
import './presentation-motion.css';
export const metadata:Metadata={title:'FORGE — CMC evidence, connected.',description:'Source-grounded CMC documentation and lifecycle integrity. Exact evidence, independent technical QC and revision-bound human review.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><PresentationMotion revealSelector=".forge-public .reveal" stageSelector=".bio-hero-sculpture" accent="#8fd7c1"/>{children}</body></html>;}
