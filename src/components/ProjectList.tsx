'use client'

import { Card } from "@/components/ui/card";
import { Database, Lock, Zap } from "lucide-react";
import { ProjectTables } from '@/components/ProjectTables';

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

export default function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <ul className="space-y-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {projects.map((project) => (
        <li key={project.id} className="bg-background/10 shadow rounded-lg p-4 backdrop-blur-lg border border-white/10">
          <h2 className="text-3xl font-semibold text-white mb-4">{project.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/10 rounded-xl border border-white/10 p-4 shadow-lg backdrop-blur-lg">
              <div className="flex flex-col items-center space-y-4 text-center p-4 rounded-2xl">
                <div className="p-3 rounded-full bg-accent/10">
                  <Database className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-white">RLS Check</h3>
                <ProjectTables projectRef={project.id} />
              </div>
            </Card>
            <Card className="bg-white/10 rounded-xl border border-white/10 p-4 shadow-lg backdrop-blur-lg">
              <div className="flex flex-col items-center space-y-4 text-center p-4 rounded-2xl">
                <div className="p-3 rounded-full bg-accent/10">
                  <Zap className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-white">MFA Check</h3>
                <p className="text-muted-foreground">MFA check coming soon</p>
              </div>
            </Card>
            <Card className="bg-white/10 rounded-xl border border-white/10 p-4 shadow-lg backdrop-blur-lg">
              <div className="flex flex-col items-center space-y-4 text-center p-4 rounded-2xl">
                <div className="p-3 rounded-full bg-accent/10">
                  <Lock className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-white">PITR Check</h3>
                <p className="text-muted-foreground">PITR check coming soon</p>
              </div>
            </Card>
          </div>
          <div className="mt-4 text-white">
            <p>ID: {project.id}</p>
            <p>Region: {project.region}</p>
            <p>Created at: {new Date(project.created_at).toLocaleString()}</p>
            {project.database && (
              <div>
                <p>Database: {project.database.host}</p>
                <p>Version: {project.database.version}</p>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}