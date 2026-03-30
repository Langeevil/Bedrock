export interface TaskFile {
  id: number;
  task_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_by: number;
  uploaded_by_name: string;
  uploaded_at: string;
}

export interface TaskSubmission {
  id: number;
  task_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  status: "pending" | "submitted" | "completed";
  submitted_at: string | null;
  completed_at: string | null;
  grade: number | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
  files?: SubmissionFile[];
}

export interface SubmissionFile {
  id: number;
  submission_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

export interface DisciplineTask {
  id: number;
  discipline_id: number;
  created_by: number;
  created_by_name: string;
  created_by_email: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: "active" | "closed";
  submission_count: number;
  created_at: string;
  updated_at: string;
  files?: TaskFile[];
  userSubmission?: TaskSubmission | null;
  allSubmissions?: TaskSubmission[] | null;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
}

export interface GradeSubmissionRequest {
  grade: number;
  feedback?: string;
}
