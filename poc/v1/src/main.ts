// POC V1 — 純前端 Todo App
//
// 這個版本沒有後端，所有資料都存在瀏覽器的 localStorage。
// 關掉分頁、重開瀏覽器，資料都還在；但換一台電腦或換一個瀏覽器就看不到了——
// 這正是 V2 之後要引入「後端」的理由：讓資料離開單一台瀏覽器。

// 一筆待辦事項的形狀。先定義資料長什麼樣子，後面的程式碼才有依據。
interface Todo {
  id: number
  text: string
  completed: boolean
}

// localStorage 的鍵名。用常數集中管理，避免到處出現魔術字串打錯字。
const STORAGE_KEY = "todos-v1"

// 選取畫面上會用到的元素。HTML 裡親手寫了這些 id，所以用 as 斷言確切型別。
const input = document.getElementById("todo-input") as HTMLInputElement
const addBtn = document.getElementById("add-btn") as HTMLButtonElement
const list = document.getElementById("todo-list") as HTMLUListElement
const emptyHint = document.getElementById("empty-hint") as HTMLParagraphElement
const counter = document.getElementById("counter") as HTMLParagraphElement

// 應用程式的「唯一資料來源」（single source of truth）。
// 畫面永遠是這份陣列的反映——改資料 → 重新渲染，而不是直接東改一塊西改一塊。
let todos: Todo[] = loadTodos()

// 從 localStorage 讀出先前存的待辦。第一次開啟時沒有資料，就回傳空陣列。
function loadTodos(): Todo[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  // localStorage 只能存字串，所以存進去前轉成 JSON、讀出來再轉回物件。
  return JSON.parse(raw) as Todo[]
}

// 把目前的待辦陣列寫回 localStorage。任何會改動 todos 的操作之後都要呼叫它。
function saveTodos(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

// 產生一筆待辦的 id。用「目前最大的 id + 1」確保不重複。
function createNextId(): number {
  if (todos.length === 0) return 1
  const ids = todos.map((todo) => todo.id)
  return Math.max(...ids) + 1
}

// 建立單一待辦項目的 <li> 元素。把「一筆資料 → 一段畫面」的邏輯集中在這裡，
// 之後想改項目的長相（加日期、加編輯按鈕…）只要動這個函式。
function createTodoElement(todo: Todo): HTMLLIElement {
  const li = document.createElement("li")
  li.className = todo.completed ? "todo-item completed" : "todo-item"

  const checkbox = document.createElement("input")
  checkbox.type = "checkbox"
  checkbox.checked = todo.completed
  checkbox.addEventListener("change", () => toggleTodo(todo.id))

  const textSpan = document.createElement("span")
  textSpan.className = "todo-text"
  textSpan.textContent = todo.text

  const deleteBtn = document.createElement("button")
  deleteBtn.className = "delete-btn"
  deleteBtn.textContent = "✕"
  deleteBtn.title = "刪除這筆待辦"
  deleteBtn.addEventListener("click", () => deleteTodo(todo.id))

  li.appendChild(checkbox)
  li.appendChild(textSpan)
  li.appendChild(deleteBtn)
  return li
}

// 把整份 todos 重新畫到畫面上。
// 做法是「清空 + 重畫」：先倒掉舊畫面，再依資料重建，畫面就永遠跟資料一致。
function render(): void {
  list.innerHTML = ""
  todos.forEach((todo) => list.appendChild(createTodoElement(todo)))

  // 沒有待辦時顯示提示文字
  emptyHint.className = todos.length === 0 ? "empty-hint visible" : "empty-hint"

  const remaining = todos.filter((todo) => !todo.completed).length
  counter.textContent =
    todos.length === 0 ? "" : `還有 ${remaining} 件未完成，共 ${todos.length} 件`
}

// 新增一筆待辦
function addTodo(): void {
  // trim() 移除前後空白，避免只按空白鍵就新增一個看起來空白的項目
  const text = input.value.trim()
  if (!text) return

  todos.push({ id: createNextId(), text, completed: false })

  saveTodos()
  render()

  // 清空輸入框並重新聚焦，方便連續輸入下一筆
  input.value = ""
  input.focus()
}

// 切換某筆待辦的完成狀態
function toggleTodo(id: number): void {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo,
  )
  saveTodos()
  render()
}

// 刪除某筆待辦
function deleteTodo(id: number): void {
  todos = todos.filter((todo) => todo.id !== id)
  saveTodos()
  render()
}

// 綁定事件：點按鈕新增，或在輸入框按 Enter 也能新增
addBtn.addEventListener("click", addTodo)
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addTodo()
})

// 啟動：把 localStorage 裡的資料畫到畫面上
render()
