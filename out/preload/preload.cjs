"use strict";
const electron = require("electron");
const api = {
  students: {
    getAll: () => electron.ipcRenderer.invoke("students:getAll"),
    getById: (id) => electron.ipcRenderer.invoke("students:getById", id),
    create: (data) => electron.ipcRenderer.invoke("students:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("students:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("students:delete", id),
    getStats: (id) => electron.ipcRenderer.invoke("students:getStats", id)
  },
  lessons: {
    getAll: (startDate, endDate) => electron.ipcRenderer.invoke("lessons:getAll", startDate, endDate),
    getById: (id) => electron.ipcRenderer.invoke("lessons:getById", id),
    getByStudent: (studentId) => electron.ipcRenderer.invoke("lessons:getByStudent", studentId),
    create: (data) => electron.ipcRenderer.invoke("lessons:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("lessons:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("lessons:delete", id),
    move: (id, dayOfWeek, startTime, endTime) => electron.ipcRenderer.invoke("lessons:move", id, dayOfWeek, startTime, endTime)
  },
  records: {
    getAll: (studentId) => electron.ipcRenderer.invoke("records:getAll", studentId),
    getById: (id) => electron.ipcRenderer.invoke("records:getById", id),
    create: (data) => electron.ipcRenderer.invoke("records:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("records:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("records:delete", id)
  },
  homework: {
    getAll: (studentId) => electron.ipcRenderer.invoke("homework:getAll", studentId),
    getById: (id) => electron.ipcRenderer.invoke("homework:getById", id),
    getSections: (homeworkId) => electron.ipcRenderer.invoke("homework:getSections", homeworkId),
    getRecordings: (sectionId) => electron.ipcRenderer.invoke("homework:getRecordings", sectionId),
    createHomework: (data) => electron.ipcRenderer.invoke("homework:createHomework", data),
    updateHomework: (id, data) => electron.ipcRenderer.invoke("homework:updateHomework", id, data),
    deleteHomework: (id) => electron.ipcRenderer.invoke("homework:deleteHomework", id),
    createSection: (data) => electron.ipcRenderer.invoke("homework:createSection", data),
    updateSection: (id, data) => electron.ipcRenderer.invoke("homework:updateSection", id, data),
    updateSectionStatus: (id, status) => electron.ipcRenderer.invoke("homework:updateSectionStatus", id, status),
    deleteSection: (id) => electron.ipcRenderer.invoke("homework:deleteSection", id),
    createRecording: (data) => electron.ipcRenderer.invoke("homework:createRecording", data),
    updateRecording: (id, data) => electron.ipcRenderer.invoke("homework:updateRecording", id, data),
    deleteRecording: (id) => electron.ipcRenderer.invoke("homework:deleteRecording", id)
  },
  billing: {
    getAll: (studentId) => electron.ipcRenderer.invoke("billing:getAll", studentId),
    getById: (id) => electron.ipcRenderer.invoke("billing:getById", id),
    getMonthlyStats: () => electron.ipcRenderer.invoke("billing:getMonthlyStats"),
    getSummary: () => electron.ipcRenderer.invoke("billing:getSummary"),
    create: (data) => electron.ipcRenderer.invoke("billing:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("billing:update", id, data),
    delete: (id) => electron.ipcRenderer.invoke("billing:delete", id),
    togglePaid: (id) => electron.ipcRenderer.invoke("billing:togglePaid", id)
  },
  files: {
    selectAudio: () => electron.ipcRenderer.invoke("files:selectAudio"),
    saveAudio: (fileName, arrayBuffer) => electron.ipcRenderer.invoke("files:saveAudio", fileName, arrayBuffer),
    savePdf: (fileName, arrayBuffer) => electron.ipcRenderer.invoke("files:savePdf", fileName, arrayBuffer)
  }
};
electron.contextBridge.exposeInMainWorld("api", api);
