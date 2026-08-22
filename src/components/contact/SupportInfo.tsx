'use client';

import { Card } from '@/components/ui/card';
import { Youtube, Twitter, Linkedin, Facebook } from 'lucide-react';

export function SupportInfo() {
  return (
    <Card className="p-6 border-[#E2E8F0] shadow-sm bg-white h-full flex flex-col rounded-xl">
        <h3 className="text-lg font-bold text-[#0F172A] mb-6">Support Info</h3>
        
        <div className="space-y-6 flex-grow">
            <div>
                <h4 className="text-xs font-bold text-[#0F172A] mb-1 uppercase tracking-wider">Email</h4>
                <a href="mailto:support@deshexam.com" className="text-sm text-[#16A34A] hover:underline">support@deshexam.com</a>
            </div>
            
            <div>
                <h4 className="text-xs font-bold text-[#0F172A] mb-1 uppercase tracking-wider">Phone</h4>
                <p className="text-sm text-[#64748B]">+91 90022 53282</p>
            </div>
            
            <div>
                <h4 className="text-xs font-bold text-[#0F172A] mb-1 uppercase tracking-wider">Address</h4>
                <p className="text-sm text-[#64748B] leading-relaxed">Dwarikamari, Petla, Dinhata,<br/>West Bengal 736135, India</p>
            </div>
            
            <div>
                <h4 className="text-xs font-bold text-[#0F172A] mb-1 uppercase tracking-wider">Support Hours</h4>
                <p className="text-sm text-[#64748B] leading-relaxed">
                    Mon-Fri: 9AM-8PM<br/>
                    Sat: 10AM-6PM<br/>
                    Sun: Limited support
                </p>
            </div>
        </div>

        <div className="flex gap-4 mt-8 pt-6 border-t border-[#E2E8F0]">
            <a href="#" className="w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#64748B] hover:text-[#16A34A] hover:bg-[#16A34A]/10 transition-colors">
                <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#64748B] hover:text-[#16A34A] hover:bg-[#16A34A]/10 transition-colors">
                <Youtube className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#64748B] hover:text-[#16A34A] hover:bg-[#16A34A]/10 transition-colors">
                <Linkedin className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#64748B] hover:text-[#16A34A] hover:bg-[#16A34A]/10 transition-colors">
                <Facebook className="w-4 h-4" />
            </a>
        </div>
    </Card>
  );
}
