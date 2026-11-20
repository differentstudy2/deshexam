'use client';

import { Youtube, Twitter, Linkedin, Facebook } from 'lucide-react';

export function SupportInfo() {
  // Plain div below (not shadcn Card): Card's theme bg-card renders white
  // in light mode, which made the white headings unreadable.
  return (
    <div className="p-6 border border-white/10 shadow-sm bg-[#0a1626] h-full flex flex-col rounded-xl">
        <h3 className="text-lg font-bold text-white mb-6">Support Info</h3>
        
        <div className="space-y-6 flex-grow">
            <div>
                <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider">Email</h4>
                <a href="mailto:support@deshexam.com" className="text-sm text-[#4ade80] hover:underline">support@deshexam.com</a>
            </div>
            
            <div>
                <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider">Phone</h4>
                                <p className="text-sm text-slate-300">+91 62940 06590</p>
            </div>
            
            <div>
                <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider">Address</h4>
                <p className="text-sm text-slate-300 leading-relaxed">Dwarikamari, Petla, Dinhata,<br/>West Bengal 736135, India</p>
            </div>
            
            <div>
                <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider">Support Hours</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                    Mon-Fri: 9AM-8PM<br/>
                    Sat: 10AM-6PM<br/>
                    Sun: Limited support
                </p>
            </div>
        </div>

        <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
            <a href="#" className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-[#4ade80] hover:bg-[#16A34A]/15 transition-colors">
                <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-[#4ade80] hover:bg-[#16A34A]/15 transition-colors">
                <Youtube className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-[#4ade80] hover:bg-[#16A34A]/15 transition-colors">
                <Linkedin className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-[#4ade80] hover:bg-[#16A34A]/15 transition-colors">
                <Facebook className="w-4 h-4" />
            </a>
        </div>
    </div>
  );
}
