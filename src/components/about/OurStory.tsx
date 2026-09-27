import { Card } from "@/components/ui/card";

export function OurStory() {
  const timeline = [
    { year: "2023", event: "Started", description: "Launched our first prototype to a small group of students." },
    { year: "2024", event: "Added Mock Tests", description: "Introduced a robust exam simulation engine." },
    { year: "2025", event: "Added Institutions", description: "Expanded our platform to support schools and coaching centers." },
    { year: "2026", event: "AI Learning Tools", description: "Integrated smart analytics and personalized learning paths." },
  ];

  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="container max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Illustration */}
          <div className="order-2 lg:order-1 flex justify-center">
            <div className="relative w-full max-w-lg aspect-square">
              {/* Background decorative blob */}
              <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-3xl transform scale-90"></div>
              <img 
                src="/about-story-illustration.png" 
                alt="Students learning on DeshExam platform" 
                className="relative z-10 w-full h-full object-contain animate-float drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Right: Timeline */}
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl font-extrabold text-[#0F172A] mb-6">Our Story</h2>
            <p className="text-lg text-[#64748B] mb-12 leading-relaxed max-w-xl">
              DeshExam is a modern educational platform built to help students learn smarter through mock tests, courses, problems, documents, question banks, and AI-powered learning tools.
            </p>

            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-200 group-[.is-active]:bg-[#16A34A] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  {/* Card */}
                  <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 shadow-sm border-[#E2E8F0] hover:shadow-md hover:border-[#16A34A]/50 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                      <span className="font-bold text-[#16A34A] text-lg">{item.year}</span>
                    </div>
                    <h3 className="font-bold text-[#0F172A] text-base mb-1">{item.event}</h3>
                    <p className="text-sm text-[#64748B]">{item.description}</p>
                  </Card>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
