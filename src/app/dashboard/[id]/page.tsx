import { Card, CardContent } from "@/components/ui/card";
import { Hammer } from "lucide-react";

export default async function ComingSoonPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const pageName = params.id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="flex h-[70vh] items-center justify-center">
      <Card className="w-full max-w-lg border-dashed border-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 shadow-none text-center p-8">
        <CardContent className="pt-6 flex flex-col items-center justify-center">
          <div className="h-24 w-24 bg-white dark:bg-slate-900 rounded-full shadow-sm flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-800">
            <Hammer className="h-12 w-12 text-[#00a651]" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-3">
            {pageName}
          </h2>
          <div className="inline-block bg-[#00a651]/10 text-[#00a651] px-3 py-1 rounded-full text-sm font-semibold mb-4">
            Coming Soon
          </div>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            We're currently building out the <strong>{pageName}</strong> module. It will be available in an upcoming update!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
