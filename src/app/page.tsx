'use client'

import Image from "next/image";
import GodelNumberingVisualizer from "../components/godel-numbering-visualizer";

export default function Home() {
  return (
    <div>
      <GodelNumberingVisualizer/>
    </div>
  );
}
