import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/style.css";
import taskFieldTemplate from "./templates/taskField.html";
import noAccessTemplate from "./templates/noAccess.html";
import adminTemplate from "./templates/adminTaskField.html";
import { User } from "./models/User";
import { generateTestUser } from "./utils";
import { State } from "./state";
import { authUser } from "./services/auth";
import { addNewTask, loadUserTasks, addTaskToProgress, loadTasksToDropdown, addTaskToFinished, updateButtonsState, modifyTasks, countTasks } from "./services/task";
import { userManager } from "./services/userManagement";

export const appState = new State();

const loginForm = document.querySelector("#app-login-form");
const userInfo = document.querySelector("#user-info");
const userGreeting = document.querySelector(".user-greeting");
const logoutBtn = document.querySelector("#logout-btn");
const contentWithoutAuth = document.querySelector(".content-withoutAuth");
const contentAuth = document.querySelector(".content-auth");
const footer = document.querySelector(".kanban-footer");


function showHeaderContent(login) {
  userGreeting.textContent = `Здравствуйте, ${login}`;
  userInfo.classList.remove("d-none");
  loginForm.classList.add("d-none");
  contentWithoutAuth.classList.add("d-none");
  contentAuth.classList.remove("d-none");
  document.querySelector(".navbar-toggler").classList.add("d-none");

  const menuToggle = document.querySelector('.dropdown-toggle');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  dropdownMenu.style.display = 'none';
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.removeEventListener('click', toggleMenu);
  menuToggle.addEventListener('click', toggleMenu);
}

function toggleMenu() {
  const menuToggle = document.querySelector('.dropdown-toggle');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', !isExpanded);
  dropdownMenu.style.display = isExpanded ? 'none' : 'block';
}

generateTestUser(User);

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const login = formData.get("login");
  const password = formData.get("password");

  if (authUser(login, password)) {
    localStorage.setItem('currentUser', JSON.stringify([{ login, password }]));
    showHeaderContent(login);
    if (appState.isAdmin == true) {
      document.querySelector(".content").innerHTML = adminTemplate;
      footer.classList.add("d-none");
      userManager();
    } else {
      document.querySelector(".content").innerHTML = taskFieldTemplate;
      footer.classList.remove("d-none");
      loadUserTasks();
      addNewTask(document);
      modifyTasks(document);
      addTaskToProgress(document);
      addTaskToFinished(document);
      loadTasksToDropdown();
      updateButtonsState();
      countTasks();
    }
  } else {
    alert("Доступ запрещен!");
    contentWithoutAuth.innerHTML = noAccessTemplate;
  }
});

logoutBtn.addEventListener("click", function () {
  appState.currentUser = null;
  localStorage.removeItem("currentUser");
  footer.classList.remove("d-none");
  userInfo.classList.add("d-none");
  loginForm.classList.remove("d-none");
  contentWithoutAuth.classList.remove("d-none");
  contentAuth.classList.add("d-none");
  loginForm.querySelector("input[name='login']").value = '';
  loginForm.querySelector("input[name='password']").value = '';
  contentWithoutAuth.innerHTML = "Please Sign In to see your tasks!";
});