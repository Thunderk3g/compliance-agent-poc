
import { RevealOnScroll } from "@/components/react-bits/RevealOnScroll";
import RulesTab from "@/components/settings/RulesTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LucideSettings, LucideShieldAlert } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage application preferences and compliance rules.</p>
      </div>

      <RevealOnScroll>
        <div className="p-1">
             <Tabs defaultValue="rules" className="w-full">
                <TabsList className="mb-8 p-1.5 h-auto bg-surface-100 dark:bg-white/5 rounded-xl border border-surface-200 dark:border-white/5">
                    <TabsTrigger value="general" className="gap-2 px-6 py-2.5 rounded-lg data-[state=active]:shadow-md">
                        <LucideSettings className="w-4 h-4" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="rules" className="gap-2 px-6 py-2.5 rounded-lg data-[state=active]:shadow-md">
                        <LucideShieldAlert className="w-4 h-4" />
                        Risk Rules
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <div className="p-12 text-center bg-white/50 dark:bg-card/50 rounded-3xl border border-surface-200 dark:border-white/5 border-dashed">
                        <h3 className="text-lg font-semibold text-foreground">General Settings</h3>
                        <p className="text-muted-foreground mt-2">App preferences and profile settings coming soon.</p>
                    </div>
                </TabsContent>

                <TabsContent value="rules">
                    <RulesTab />
                </TabsContent>
            </Tabs>
        </div>
      </RevealOnScroll>
    </div>
  );
}
