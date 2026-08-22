import { Play } from "lucide-react";

export function PlatformDemo() {
  return (
    <section className="py-24 bg-[#0F172A] relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-b from-[#16A34A]/20 to-transparent blur-[120px] pointer-events-none"></div>
      
      <div className="container max-w-[1400px] mx-auto px-6 relative z-10 text-center">
        
        <div className="mb-16">
            <h2 className="text-sm font-bold text-[#16A34A] uppercase tracking-widest mb-4">Interactive Experience</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-6">See DeshExam in Action</h3>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Experience the sleek, distraction-free environment our students use every day to achieve top percentiles.
            </p>
        </div>

        <div className="relative max-w-6xl mx-auto group cursor-pointer">
            {/* The Dashboard Image */}
            <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative bg-slate-900 aspect-video">
                <img 
                    src="/deshexam-dashboard-demo.png" 
                    alt="DeshExam Student Dashboard Interface Mockup" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                />
                
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-[0_0_40px_rgba(255,255,255,0.2)] group-hover:scale-110 group-hover:bg-[#16A34A]/90 group-hover:border-[#16A34A] transition-all duration-300">
                        <Play className="w-10 h-10 ml-2 fill-current" />
                    </div>
                </div>
            </div>

            {/* Glowing reflection under the image */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-12 bg-[#16A34A]/40 blur-[40px] -z-10 rounded-full"></div>
        </div>

      </div>
    </section>
  );
}
