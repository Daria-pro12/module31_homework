export const getFromStorage = function (key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
};

export const addToStorage = function (obj, key) {
  const storageData = getFromStorage(key);
  // Проверяем, существует ли уже пользователь с таким логином 
  const existingUserIndex = storageData.findIndex(user => user.login === obj.login);
  if (existingUserIndex === -1) {
    storageData.push(obj);
    localStorage.setItem(key, JSON.stringify(storageData));
  }
};

export const generateTestUser = function (User) {
  const testUser = new User("test", "qwerty123");
  User.save(testUser);
  const testAdmin = new User("admin", "123", true);
  User.save(testAdmin);
};
