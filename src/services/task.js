import { appState } from "../app";
import { Task } from "../models/Task";

// Функция для создания HTML-элемента задачи
const createTaskElement = (task) => {
  const newTask = document.createElement("div");
  newTask.classList.add("task-item");
  newTask.setAttribute("draggable", "true"); // Добавляем атрибут draggable
  newTask.innerHTML = `
    <p class="task-text">${task.description}</p>
    <div class="btn-modify">
    <button class="btn-edit">&#128393</button>
    <button class="btn-delete">&#10008;</button>
    </div>`;
  // Добавляем обработчик события dragstart 
  newTask.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", task.description); // Сохраняем описание задачи
    e.currentTarget.classList.add("dragging"); // Добавляем класс для визуализации перетаскивания
  });

  // Добавляем обработчик события dragend 
  newTask.addEventListener("dragend", (e) => {
    e.currentTarget.classList.remove("dragging"); // Убираем класс при завершении перетаскивания
  });

  return newTask;
};

// Обновление состояния кнопок
export const updateButtonsState = function () {
  const tasks = Task.getUserTasks(appState.currentUser.id);
  const addBtnProgress = document.querySelector(".btn-progress");
  const addBtnFinished = document.querySelector(".btn-finished");

  //Проверяем, есть ли задачи в состоянии "Ready" и деактивируем кнопку "Add card" в In Progress, если задач нет
  addBtnProgress.disabled = !tasks.some(task => task.state === "ready");
  //Проверяем, есть ли задачи в состоянии "In Progress" и деактивируем кнопку "Add card" в Finished, если задач нет
  addBtnFinished.disabled = !tasks.some(task => task.state === "progress");
};

// Загрузка задач пользователя
export const loadUserTasks = function () {
  if (!appState.currentUser) return;

  const userTasks = Task.getUserTasks(appState.currentUser.id);

  const taskListReady = document.querySelector(".kanban-ready");
  const taskListProgress = document.querySelector(".kanban-progress");
  const taskListFinished = document.querySelector(".kanban-finished");
  taskListReady.innerHTML = '';
  taskListProgress.innerHTML = '';
  taskListFinished.innerHTML = '';
  userTasks.forEach(task => {
    const taskElement = createTaskElement(task);
    if (task.state === "ready") {
      taskListReady.appendChild(taskElement);
    } else if (task.state === "progress") {
      taskListProgress.appendChild(taskElement);
    } else if (task.state === "finished") {
      taskListFinished.appendChild(taskElement);
    }
    updateButtonsState();
    setupDragAndDrop();
  });
};

// добавление задачи в ready
export const addNewTask = function (document) {
  const inputTask = document.querySelector(".input");
  const submitBtn = document.querySelector(".btn-submit");
  const addBtn = document.querySelector(".btn-add");

  addBtn.addEventListener("click", function (e) {
    inputTask.classList.remove("d-none");
    addBtn.classList.add("d-none");
    submitBtn.classList.remove("d-none");
  });

  submitBtn.addEventListener("click", function (e) {
    if (appState.currentUser) {
      const taskText = inputTask.value.trim();
      if (taskText !== "") {
        const task = new Task(taskText, "ready");
        task.userId = appState.currentUser.id;
        Task.save(task);
        document.querySelector(".kanban-ready").appendChild(createTaskElement(task));
        inputTask.value = "";
        inputTask.classList.add("d-none");
        submitBtn.classList.add("d-none");
        addBtn.classList.remove("d-none");
        updateButtonsState();
        setupDragAndDrop();
        countTasks();
      }
    }
  });
};

// удаление задачи 
export const deleteTask = function (document, selector) {
  const taskList = document.querySelector(selector);
  taskList.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-delete")) {
      const taskElement = e.target.closest(".task-item");
      const taskText = taskElement.querySelector(".task-text").textContent;
      const tasks = Task.getUserTasks(appState.currentUser.id);
      const taskToDelete = tasks.find(task => task.description === taskText);
      if (taskToDelete) {
        Task.delete(taskToDelete);
        taskElement.remove();
        updateButtonsState();
        countTasks();
      }
    }
  });
};

// редактирование задачи 
export const editTask = function (document, selector) {
  const taskList = document.querySelector(selector);
  taskList.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-edit")) {
      const taskElement = e.target.closest(".task-item");
      const taskText = taskElement.querySelector(".task-text").textContent;
      const tasks = Task.getUserTasks(appState.currentUser.id);
      const taskToEdit = tasks.find(task => task.description === taskText);

      if (taskToEdit) {
        const newDescription = prompt("Edit task description:", taskToEdit.description);
        if (newDescription !== null && newDescription.trim() !== "") {

          const updatedTask = new Task(newDescription.trim(), taskToEdit.state);

          Task.delete(taskToEdit);
          Task.save(updatedTask);

          taskElement.querySelector(".task-text").textContent = updatedTask.description;

          updateButtonsState();
          countTasks();
        }
      }
    }
  });
};

// Использование функций для разных списков
export const modifyTasks = function (document) {
  const taskStates = [".kanban-ready", ".kanban-progress", ".kanban-finished"];

  taskStates.forEach(state => {
    deleteTask(document, state);
    editTask(document, state);
  });
};

// загрузка задач в дропдаун
export const loadTasksToDropdown = function () {
  const dropdownProgress = document.querySelector(".dropdown-progress");
  const dropdownFinished = document.querySelector(".dropdown-finished");

  // Функция для очистки и добавления пустого элемента в дропдауны
  const initializeDropdown = (dropdown) => {
    dropdown.innerHTML = '';
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "";
    dropdown.appendChild(emptyOption);
  };

  // Инициализируем дропдауны
  initializeDropdown(dropdownProgress);
  initializeDropdown(dropdownFinished);

  // Загружаем задачи из хранилища
  const tasks = Task.getUserTasks(appState.currentUser.id);
  tasks.forEach(task => {
    const option = document.createElement("option");
    option.value = task.description;
    option.textContent = task.description;

    if (task.state === "ready") {
      dropdownProgress.appendChild(option);
    } else if (task.state === "progress") {
      dropdownFinished.appendChild(option);
    }
  });
};

// добавление задачи в In Progress и в Finished
const addTaskNewState = function (buttonSelector, dropdownSelector, newState, kanbanSelector) {
  const addBtn = document.querySelector(buttonSelector);
  const dropdown = document.querySelector(dropdownSelector);

  addBtn.addEventListener("click", function () {
    dropdown.classList.remove("d-none");
    loadTasksToDropdown(); // Загружаем задачи в дропдаун
  });

  dropdown.addEventListener("change", function () {
    const selectedTaskDescription = dropdown.value;
    if (selectedTaskDescription) {
      const tasks = Task.getUserTasks(appState.currentUser.id);
      const taskToMove = tasks.find(task => task.description === selectedTaskDescription);

      if (taskToMove) {
        taskToMove.state = newState;
        Task.delete(taskToMove);
        loadUserTasks();

        document.querySelector(kanbanSelector).appendChild(createTaskElement(taskToMove));
        Task.save(taskToMove);
        dropdown.querySelector(`option[value="${selectedTaskDescription}"]`).remove();
        dropdown.value = "";
        dropdown.classList.add("d-none");
        loadTasksToDropdown();
        updateButtonsState();
        countTasks();
      }
    }
  });
};

// Используем общую функцию для добавления задач в разные состояния
export const addTaskToProgress = function (document) {
  addTaskNewState(".btn-progress", ".dropdown-progress", "progress", ".kanban-progress");
};

export const addTaskToFinished = function (document) {
  addTaskNewState(".btn-finished", ".dropdown-finished", "finished", ".kanban-finished");
};


// Функция для обработки перетаскивания задач между колонками
const enableDropZone = (dropZoneSelector, newState) => {
  const dropZone = document.querySelector(dropZoneSelector);

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault(); 
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    const taskDescription = e.dataTransfer.getData("text/plain");
    const tasks = Task.getUserTasks(appState.currentUser.id);
    const taskToMove = tasks.find(task => task.description === taskDescription);

    if (taskToMove) {
      taskToMove.state = newState; 
      Task.delete(taskToMove);
      Task.save(taskToMove); 
      loadUserTasks(); 
      countTasks();
    }
  });
};

// Используем функцию enableDropZone для каждой колонки задач
export const setupDragAndDrop = function () {
  enableDropZone(".kanban-ready", "ready");
  enableDropZone(".kanban-progress", "progress");
  enableDropZone(".kanban-finished", "finished");
};


//подсчет активных и завершенных задач в футер
export const countTasks = function () {
  const readyTask = document.querySelector(".kanban-ready");
  const progressTask = document.querySelector(".kanban-progress");
  const finishedTask = document.querySelector(".kanban-finished");

  const activeTaskCount = readyTask.children.length + progressTask.children.length;

  document.querySelector(".ready-lenght").innerHTML = activeTaskCount;
  document.querySelector(".finished-lenght").innerHTML = finishedTask.children.length;
  document.querySelector(".name-user").innerHTML = appState._currentUser.login;
  const date = new Date();

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  document.querySelector(".year").innerHTML = [day, month, year].join(".");
};