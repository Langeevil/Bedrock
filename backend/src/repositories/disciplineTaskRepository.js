import * as taskModel from "../models/taskModel.js";

class DisciplineTaskRepository {
  // ===== DISCIPLINE TASKS =====

  async getTasksByDiscipline(disciplineId) {
    return taskModel.findTasksByDiscipline(disciplineId);
  }

  async getTaskById(taskId) {
    return taskModel.findTaskById(taskId);
  }

  async createTask(disciplineId, createdBy, taskData) {
    const { title, description, dueDate } = taskData;
    return taskModel.createTask(disciplineId, createdBy, title, description, dueDate);
  }

  async updateTask(taskId, taskData) {
    const { title, description, dueDate, status } = taskData;
    return taskModel.updateTask(taskId, title, description, dueDate, status);
  }

  async deleteTask(taskId) {
    return taskModel.deleteTask(taskId);
  }

  // ===== TASK FILES =====

  async addTaskFile(taskId, fileName, filePath, fileSize, uploadedBy) {
    return taskModel.addTaskFile(taskId, fileName, filePath, fileSize, uploadedBy);
  }

  async getTaskFiles(taskId) {
    return taskModel.getTaskFiles(taskId);
  }

  async deleteTaskFile(fileId) {
    return taskModel.deleteTaskFile(fileId);
  }

  // ===== TASK SUBMISSIONS =====

  async getSubmissionsByTask(taskId) {
    return taskModel.findSubmissionsByTask(taskId);
  }

  async getSubmissionByTaskAndUser(taskId, userId) {
    return taskModel.findSubmissionByTaskAndUser(taskId, userId);
  }

  async getSubmissionById(submissionId) {
    return taskModel.findSubmissionById(submissionId);
  }

  async createSubmission(taskId, userId) {
    return taskModel.createSubmission(taskId, userId);
  }

  async submitTask(submissionId) {
    return taskModel.submitTask(submissionId);
  }

  async completeTask(submissionId) {
    return taskModel.completeTask(submissionId);
  }

  async gradeSubmission(submissionId, grade, feedback) {
    return taskModel.gradeSubmission(submissionId, grade, feedback);
  }

  // ===== SUBMISSION FILES =====

  async addSubmissionFile(submissionId, fileName, filePath, fileSize) {
    return taskModel.addSubmissionFile(submissionId, fileName, filePath, fileSize);
  }

  async getSubmissionFiles(submissionId) {
    return taskModel.getSubmissionFiles(submissionId);
  }

  async deleteSubmissionFile(fileId) {
    return taskModel.deleteSubmissionFile(fileId);
  }
}

export default new DisciplineTaskRepository();
