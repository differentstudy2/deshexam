'use client';

import { Card } from '@/components/ui/card';
import { Mail, MessageCircle, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ContactMethods() {
  const methods = [
    {
      title: 'Email Support',
      icon: Mail,
      description: 'support@deshexam.com',
      detail: 'For questions, feedback and support',
      link: 'mailto:support@deshexam.com',
      color: 'text-[#4ade80]',
      bg: 'bg-[#16A34A]/15',
      btnColor: 'bg-[#16A34A] hover:bg-[#15803d]',
      btnText: 'Send Email'
    },
    {
      title: 'Phone Support',
      icon: PhoneCall,
            description: '+91 62940 06590',
      detail: 'Call us during support hours',
      link: 'tel:+916294006590',
      color: 'text-[#818cf8]',
      bg: 'bg-[#6366F1]/15',
      btnColor: 'bg-[#6366F1] hover:bg-[#4f46e5]',
      btnText: 'Phone Support'
    },
    {
      title: 'WhatsApp Support',
      icon: MessageCircle,
      description: 'Contact via WhatsApp',
      detail: 'Chat with us on WhatsApp',
      link: 'https://wa.me/916294006590',
      color: 'text-[#4ade80]',
      bg: 'bg-[#16A34A]/15',
      btnColor: 'bg-[#16A34A] hover:bg-[#15803d]',
      btnText: 'WhatsApp'
    },
    // Live Chat card removed — no live-chat feature exists (its button
    // linked to '#'). Restore only when live chat is actually live.
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {methods.map((method, idx) => (
        <Card key={idx} className="p-6 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/[0.04] border border-white/10 shadow-sm flex flex-col items-start rounded-xl">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${method.bg} ${method.color}`}>
            <method.icon className="w-6 h-6" strokeWidth={2} />
          </div>
          <h3 className="font-bold text-white mb-2">{method.title}</h3>
          <p className="text-sm font-medium text-slate-300 mb-1">{method.description}</p>
          <p className="text-xs text-slate-400 mb-6 flex-grow">{method.detail}</p>
          
          <Button asChild className={`w-full ${method.btnColor} text-white rounded-md h-10 font-semibold shadow-sm`}>
            <a href={method.link}>{method.btnText}</a>
          </Button>
        </Card>
      ))}
    </div>
  );
}
