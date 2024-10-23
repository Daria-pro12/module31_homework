import { getFromStorage } from "../utils";
import { User } from "../models/User";
import { appState } from "../app";
import { Task } from "../models/Task";

export const userManager = function () {
  const userForm = document.querySelector("#user-management-form");
  userForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const login = document.querySelector("#login").value;
    const password = document.querySelector("#password").value;

    const newUser = new User(login, password);
    const users = getFromStorage("users") || [];

    const existingUser = users.find((u) => u.login === newUser.login);
    if (existingUser) {
      alert("Пользователь с таким именем уже существует!");
      return;
    }

    users.push(newUser);
    User.save(newUser);
    userForm.reset();
    updateUsersList(users);
  });

  const updateUsersList = function (users) {
    const userList = document.querySelector(".user-list");

    const uniqueUsers = users.filter((user, index, self) =>
      index === self.findIndex((u) => u.login === user.login)
    );

    userList.textContent = "";

    uniqueUsers.forEach((user) => {
      const listItem = document.createElement("li");
      listItem.classList.add("user-list-item");
      listItem.textContent = `${user.login}`;

      const removeButton = document.createElement("button");
      removeButton.classList.add("btn-delete");
      removeButton.innerHTML = `&#10008;`;
      removeButton.addEventListener("click", function () {
        removeUser(user.login);
      });
      listItem.appendChild(removeButton);

      userList.appendChild(listItem);
    });
  };

  const removeUser = function (login) {
    if (login === appState._currentUser.login) {
      alert("You can't delete yourself!");
      return;
    }

    let users = getFromStorage("users") || [];
    const userToRemove = users.find(user => user.login === login);

    if (userToRemove) {
        // Удаляем все задачи, связанные с удаляемым пользователем
        const userTasks = Task.getUserTasks(userToRemove.id);
        userTasks.forEach(task => Task.delete(task));
    }

    users = users.filter((user) => user.login !== login);
    localStorage.setItem("users", JSON.stringify(users));
    updateUsersList(users);
  };

  updateUsersList(getFromStorage("users") || []);
};