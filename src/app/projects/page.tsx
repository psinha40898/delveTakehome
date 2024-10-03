import { cookies } from 'next/headers';
import Link from 'next/link';
import { ProjectTables } from '@/components/ProjectTables';
import { Card } from "@/components/ui/card";
import { Database, Lock, Zap } from "lucide-react";
import ProjectList from '@/components/ProjectList';
import { redirect } from 'next/navigation'
async function getProjects() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('supabaseAccessToken')?.value;

  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/projects`, {
    headers: {
      Cookie: `supabaseAccessToken=${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Token expired. Refresh the page.');
  }

  const data = await response.json();
  return data.projects;
}

export default async function ProjectsPage() {
  let projects;
  let error;

  try {
    projects = await getProjects();
  } catch (e) {
    error = e instanceof Error ? e.message : 'An unknown error occurred';
  }

  if (error) {
    redirect('/');
    // return (
    //   <div className="container mx-auto px-4 py-8">
    //     <h1 className="text-2xl font-bold mb-4">Error</h1>
    //     <p className="text-red-500">{error}</p>
    //     <Link href="/" className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
    //       Go back to home
    //     </Link>
    //   </div>
    // );
  }

  return (
    <div className="w-full flex flex-col items-center dark  min-h-screen">
      <section className="mt-24 flex-grow py-8 md:py-12 lg:py-16 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tighter sm:text-5xl md:text-5xl lg:text-6xl bg-gradient-to-b from-white to-gray-400 text-transparent bg-clip-text">
                Your Supabase Projects
              </h1>
            </div>
          </div>
        </div>
<div className='mt-8'>
{projects.length === 0 ? (
        <p className="text-white">No projects found. Create a new project in your Supabase dashboard to get started.</p>
      ) : (
        <ProjectList projects={projects} />
      )}
</div>
      </section>

    </div>
  );
}