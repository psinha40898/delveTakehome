'use client'

import { Card } from "@/components/ui/card"
import { Database, Lock, Zap, Info } from "lucide-react"
import { ProjectTables } from '@/components/ProjectTables'
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button"
import { MFACheck } from '@/components/MFAcheck'
import { PITRCheck } from "@/components/PITRcheck"
import { config } from '@/app/lib/supabaseOAuth';

type Project = {
  id: string;
  name: string;
  region: string;
  created_at: string;
  database?: {
    host: string;
    version: string;
  };
};

console.log(config.clientId);

export default function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <ul className="space-y-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {projects.map((project) => (
        <li key={project.id} className="bg-white/10 shadow rounded-lg p-6 backdrop-blur-lg border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-semibold text-white">{project.name}</h2>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-5 w-5 text-white" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">ID: {project.id}</p>
                  <p className="text-sm text-muted-foreground">Region: {project.region}</p>
                  <p className="text-sm text-muted-foreground">Created: {new Date(project.created_at).toLocaleString()}</p>
                  {project.database && (
                    <>
                      <p className="text-sm text-muted-foreground">Database: {project.database.host}</p>
                      <p className="text-sm text-muted-foreground">Version: {project.database.version}</p>
                    </>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-background/85 rounded-xl border border-white/10 p-6 shadow-lg backdrop-blur-lg flex flex-col">
              <div className="flex flex-col items-center space-y-4 mb-4">
                <div className="p-3 rounded-full bg-accent/10">
                  <Database className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-white">RLS Check</h3>
              </div>
              <div className="flex-grow overflow-hidden">
                <ProjectTables projectRef={project.id} />
              </div>
            </Card>
            <Card className="bg-background/85 rounded-xl border border-white/10 p-6 shadow-lg backdrop-blur-lg flex flex-col">
              <div className="flex flex-col items-center space-y-4 mb-4">
                <div className="p-3 rounded-full bg-accent/10">
                  <Zap className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-white">MFA Check</h3>
              </div>
              <div className="flex-grow overflow-hidden">
                <MFACheck projectRef={project.id} />
              </div>
            </Card>
            <Card className="bg-background/85 rounded-xl border border-white/10 p-6 shadow-lg backdrop-blur-lg flex flex-col">
              <div className="flex flex-col items-center space-y-4 mb-4">
                <div className="p-3 rounded-full bg-accent/10">
                  <Lock className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-white">PITR Check</h3>
              </div>
              <div className="flex-grow overflow-hidden">
                <PITRCheck projectRef={project.id} />
              </div>
            </Card>
          </div>
        </li>

        
      ))}
    </ul>
  );
}