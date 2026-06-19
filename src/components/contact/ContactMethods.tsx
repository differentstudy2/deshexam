'use client';

import { Card } from '@/components/ui/card';
import { Mail, MessageCircle, PhoneCall, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ContactMethods() {
  const methods = [
    {
      title: 'Email Support',
      icon: Mail,
      description: 'support@deshexam.com',
      detail: 'Replies within 2 hours',
      link: 'mailto:support@deshexam.com',
      color: 'text-[#16A34A]',
      bg: 'bg-[#16A34A]/10',
      btnColor: 'bg-[#16A34A] hover:bg-[#15803d]',
      btnText: 'Send Email'
    },
    {
      title: 'Phone Support',
      icon: PhoneCall,
      description: '+91 90022 53282',
      detail: 'Replies within 2 hours',
      link: 'tel:+919002253282',
      color: 'text-[#6366F1]',
      bg: 'bg-[#6366F1]/10',
      btnColor: 'bg-[#6366F1] hover:bg-[#4f46e5]',
      btnText: 'Phone Support'
    },
    {
      title: 'WhatsApp Support',
      icon: MessageCircle,
      description: 'Contact via WhatsApp',
      detail: 'Replies within 2 hours',
      link: 'https://wa.me/919002253282',
      color: 'text-[#16A34A]',
      bg: 'bg-[#16A34A]/10',
      btnColor: 'bg-[#16A34A] hover:bg-[#15803d]',
      btnText: 'WhatsApp'
    },
    {
      title: 'Live Chat',
      icon: LifeBuoy,
      description: 'Contact via Live Chat',
      detail: 'Replies within 2 hours',
      link: '#',
      color: 'text-[#7C3AED]',
      bg: 'bg-[#7C3AED]/10',
      btnColor: 'bg-[#7C3AED] hover:bg-[#6d28d9]',
      btnText: 'Live Chat'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {methods.map((method, idx) => (
        <Card key={idx} className="p-6 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white border border-[#E2E8F0] shadow-sm flex flex-col items-start rounded-xl">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${method.bg} ${method.color}`}>
            <method.icon className="w-6 h-6" strokeWidth={2} />
          </div>
          <h3 className="font-bold text-[#0F172A] mb-2">{method.title}</h3>
          <p className="text-sm font-medium text-[#64748B] mb-1">{method.description}</p>
          <p className="text-xs text-[#64748B] mb-6 flex-grow">{method.detail}</p>
          
          <Button asChild className={`w-full ${method.btnColor} text-white rounded-md h-10 font-semibold shadow-sm`}>
            <a href={method.link}>{method.btnText}</a>
          </Button>
        </Card>
      ))}
    </div>
  );
}
