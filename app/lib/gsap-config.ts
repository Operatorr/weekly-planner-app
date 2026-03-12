import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// @ts-ignore - GSAP ships Flip.js but types as flip.d.ts (casing mismatch)
import { Flip } from "gsap/Flip";

// Register plugins globally
gsap.registerPlugin(useGSAP, ScrollTrigger, Flip);

// Export for use throughout the app
export { gsap, useGSAP, ScrollTrigger, Flip };
