import { BaseModel } from "./BaseModel";
import { getFromStorage } from "../utils";
import { appState } from "../app";

export class Task extends BaseModel {
    constructor(description, state) {
        super();
        this.description = description;
        this.userId = appState.currentUser ? appState.currentUser.id : null;
        this.state = state;
        this.storageKey = "tasks";
    }

    static save(task) {
        try {
            const storageData = getFromStorage(task.storageKey);
            const existingTaskIndex = storageData.findIndex(t => t.description === task.description);

            if (existingTaskIndex !== -1) {
                // Если задача уже существует, обновляем её
                storageData[existingTaskIndex] = task;
            } else {
                // Если задачи нет, добавляем новую 
                storageData.push(task);
            }
            localStorage.setItem(task.storageKey, JSON.stringify(storageData));
            return true;
        } catch (e) {
            throw new Error(e);
        }
    }

    static getUserTasks(userId) {
        const tasks = getFromStorage("tasks");
        return tasks.filter(task => task.userId === userId);
    }

    static delete(task) {
        try {
            const storageData = getFromStorage(task.storageKey);
            const index = storageData.findIndex((n) => n.description === task.description);
            if (index !== -1) {
                storageData.splice(index, 1);
                localStorage.setItem(task.storageKey, JSON.stringify(storageData));
            }
            return true;
        } catch (e) {
            throw new Error(e);
        }
    }
}