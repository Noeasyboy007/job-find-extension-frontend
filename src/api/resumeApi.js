import { apiRequest } from "./http";

export function uploadResume({ file, fileName }) {
  const formData = new FormData();
  formData.append("file", file);
  if (fileName) {
    formData.append("file_name", fileName);
  }
  return apiRequest("/resumes/upload", {
    method: "POST",
    auth: true,
    body: formData,
  });
}

export function getResumes() {
  return apiRequest("/resumes", { auth: true });
}

export function getResumeById(id) {
  return apiRequest(`/resumes/${id}`, { auth: true });
}

export function deleteResume(id) {
  return apiRequest(`/resumes/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

