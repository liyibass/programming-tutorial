// POC V3 前端 — 完整 CRUD
//
// 相較 V2：加上「勾選完成（PUT）」與「刪除（DELETE）」，並讀後端的一致錯誤格式。
// 每次改動成功後都重新跟後端拿最新清單，確保畫面跟後端一致。

const API_BASE = "http://localhost:3000"

interface Todo {
  id: number
  text: string
  completed: boolean
}

const input = document.getElementById("todo-input") as HTMLInputElement
const addBtn = document.getElementById("add-btn") as HTMLButtonElement
const list = document.getElementById("todo-list") as HTMLUListElement
const emptyHint = document.getElementById("empty-hint") as HTMLParagraphElement

// 把後端的錯誤訊息讀出來（後端約定錯誤都放在 error 欄位）。
async function readError(response: Response): Promise<string> {
  try {
    const data = await response.json()
    return data.error ?? `狀態碼 ${response.status}`
  } catch {
    return `狀態碼 ${response.status}`
  }
}

function createTodoElement(todo: Todo): HTMLLIElement {
  const li = document.createElement("li")
  li.className = todo.completed ? "todo-item completed" : "todo-item"

  const checkbox = document.createElement("input")
  checkbox.type = "checkbox"
  checkbox.checked = todo.completed
  // 勾選 → 對後端發 PUT，把新的完成狀態送過去
  checkbox.addEventListener("change", () => toggleTodo(todo.id, checkbox.checked))

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

function render(todos: Todo[]): void {
  list.innerHTML = ""
  todos.forEach((todo) => list.appendChild(createTodoElement(todo)))
  emptyHint.className = todos.length === 0 ? "empty-hint visible" : "empty-hint"
}

// READ：載入整份清單
async function loadTodos(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/todos`)
    if (!response.ok) throw new Error(await readError(response))
    const todos: Todo[] = await response.json()
    render(todos)
  } catch (error) {
    console.error("載入失敗：", error)
    alert("載入失敗，請確認後端有沒有啟動")
  }
}

// CREATE：新增
async function addTodo(): Promise<void> {
  const text = input.value.trim()
  if (!text) return
  try {
    const response = await fetch(`${API_BASE}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
    if (!response.ok) throw new Error(await readError(response))
    await loadTodos()
    input.value = ""
    input.focus()
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知的錯誤"
    alert(`新增失敗：${message}`)
  }
}

// UPDATE：切換完成狀態
async function toggleTodo(id: number, completed: boolean): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    })
    if (!response.ok) throw new Error(await readError(response))
    await loadTodos()
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知的錯誤"
    alert(`更新失敗：${message}`)
    await loadTodos() // 失敗時也重新載入，讓 checkbox 回到後端真正的狀態
  }
}

// DELETE：刪除
async function deleteTodo(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/todos/${id}`, { method: "DELETE" })
    if (!response.ok) throw new Error(await readError(response))
    await loadTodos()
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知的錯誤"
    alert(`刪除失敗：${message}`)
  }
}

addBtn.addEventListener("click", addTodo)
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addTodo()
})

loadTodos()
