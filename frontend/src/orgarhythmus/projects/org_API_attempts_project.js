import { authFetch } from "../../auth";




// getCurrentProjectIdFromLocation (helper)
function getCurrentProjectIdFromLocation() {
  // Beispiel-Pfad: /orgarhythmus/projects/1/attempts
  const path = window.location.pathname; 
  const parts = path.split("/").filter(Boolean); 
  // ["orgarhythmus", "projects", "1", "attempts"]

  const projectsIndex = parts.indexOf("projects");
  if (projectsIndex === -1 || projectsIndex + 1 >= parts.length) {
    return null;
  }

  const id = parseInt(parts[projectsIndex + 1], 10);
  return Number.isNaN(id) ? null : id;
}

// fetch_all_attempts
export async function fetch_all_attempts() {
  const projectId = getCurrentProjectIdFromLocation();
  if (!projectId) {
    throw new Error("No projectId in URL for attempts");
  }

  const res = await authFetch(
    `/api/orgarhythmus/projects/${projectId}/attempts/`,
    { method: "GET" }
  );

  if (!res.ok) {
    throw new Error("Could not load attempts for this project");
  }

  const data = await res.json();

  // Be robust: if it’s already an array, return it; otherwise use data.attempts
  if (Array.isArray(data)) {
    return data;
  }

console.log("ALL att inside the api_______ ", data.attempts)
  return data.attempts || [];
}

// add_attempt_dependency
export async function add_attempt_dependency(vortakt_attempt_id, nachtakt_attempt_id) {
  const projectId = getCurrentProjectIdFromLocation();
  if (!projectId) {
    throw new Error("No projectId in URL for attempts");
  }

  const res = await authFetch(
    `/api/orgarhythmus/projects/${projectId}/attempt_dependencies/`,
    {
      method: "POST",
      body: JSON.stringify({ vortakt_attempt_id, nachtakt_attempt_id }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to add attempt dependency");
  }

  return await res.json();
}

// fetch_all_attempt_dependencies
export async function fetch_all_attempt_dependencies() {
  const projectId = getCurrentProjectIdFromLocation();
  if (!projectId) {
    throw new Error("No projectId in URL for attempts");
  }

  const res = await authFetch(
    `/api/orgarhythmus/projects/${projectId}/attempt_dependencies/`,
    { method: "GET" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch attempt dependencies");
  }

  return await res.json();
}

// update_attempt_slot_index
export async function update_attempt_slot_index(attempt_id, slot_index) {
  const projectId = getCurrentProjectIdFromLocation();
  if (!projectId) {
    throw new Error("No projectId in URL for attempts");
  }

  const res = await authFetch(
    `/api/orgarhythmus/projects/${projectId}/attempts/update_slot_index/`,
    {
      method: "POST",
      body: JSON.stringify({ attempt_id, slot_index }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to update attempt slot_index");
  }

  return await res.json();
}

// delete_attempt_dependency
export async function delete_attempt_dependency(dependency_id) {
  const projectId = getCurrentProjectIdFromLocation();
  if (!projectId) {
    throw new Error("No projectId in URL for attempts");
  }

  const res = await authFetch(
    `/api/orgarhythmus/projects/${projectId}/attempt_dependencies/delete/`,
    {
      method: "POST",
      body: JSON.stringify({ dependency_id }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete attempt dependency");
  }

  return await res.json();
}

// fetchTeamsForProject
export async function fetchTeamsForProject() {

    const projectId = getCurrentProjectIdFromLocation();
  const res = await authFetch(`/api/orgarhythmus/projects/${projectId}/teams/`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch teams for project");
  }

  return await res.json();
}

// fetchTeamsForCurrentProject
export async function fetchTeamsForCurrentProject() {
  const projectId = getCurrentProjectIdFromLocation();
  if (!projectId) {
    throw new Error("No projectId in URL for teams");
  }

  const res = await authFetch(
    `/api/orgarhythmus/projects/${projectId}/teams/`,
    { method: "GET" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch teams for current project");
  }

  const data = await res.json();
  // dein View gibt direkt ein Array von Teams zurück
  // => einfach so zurückgeben
  return data;
}










