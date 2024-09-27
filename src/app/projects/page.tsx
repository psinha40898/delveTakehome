import { cookies } from 'next/headers';
import Link from 'next/link';

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
    throw new Error('Failed to fetch projects');
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
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
        <Link href="/" className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Go back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Your Supabase Projects</h1>
      {projects.length === 0 ? (
        <p>No projects found. Create a new project in your Supabase dashboard to get started.</p>
      ) : (
        <ul className="space-y-4">
          {projects.map((project) => (
            <li key={project.id} className="bg-white shadow rounded-lg p-4">
              <h2 className="text-xl font-semibold">{project.name}</h2>
              <p className="text-gray-600">ID: {project.id}</p>
              <p className="text-gray-600">Region: {project.region}</p>
              <p className="text-gray-600">Created at: {new Date(project.created_at).toLocaleString()}</p>
              {project.database && (
                <div className="mt-2">
                  <p className="text-gray-600">Database: {project.database.host}</p>
                  <p className="text-gray-600">Version: {project.database.version}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}