// POC V2 前端 — 用 fetch 跟後端溝通
//
// 跟 V1 比，這裡的「資料來源」變了：
//   V1：資料在 localStorage（讀寫自己的瀏覽器）
//   V2：資料在後端（用 fetch 發 HTTP 請求去讀寫）
// 畫面渲染的邏輯幾乎一樣，變的是「資料從哪來、存到哪去」。

// 後端的位址。開發階段後端跑在 localhost:3000。
const API_BASE = "http://localhost:3000"

// 一筆待辦的形狀，要跟後端回傳的結構一致。
interface Todo {
  id: number
  text: string
  completed: boolean
}

const input = document.getElementById("todo-input") as HTMLInputElement
const addBtn = document.getElementById("add-btn") as HTMLButtonElement
const list = document.getElementById("todo-list") as HTMLUListElement
const emptyHint = document.getElementById("empty-hint") as HTMLParagraphElement

// 建立單一待辦的 <li>。和 V1 幾乎一樣——畫面這層不在乎資料是從哪來的。
// （V2 還沒做「勾選完成 / 刪除」，那需要 PUT / DELETE，留到 V3 的完整 CRUD。）
function createTodoElement(todo: Todo): HTMLLIElement {
  const li = document.createElement("li")
  li.className = todo.completed ? "todo-item completed" : "todo-item"

  const textSpan = document.createElement("span")
  textSpan.className = "todo-text"
  textSpan.textContent = todo.text

  li.appendChild(textSpan)
  return li
}

// 把一份待辦陣列畫到畫面上
function render(todos: Todo[]): void {
  list.innerHTML = ""
  todos.forEach((todo) => list.appendChild(createTodoElement(todo)))
  emptyHint.className = todos.length === 0 ? "empty-hint visible" : "empty-hint"
}

// 向後端要整份待辦清單（GET）
async function loadTodos(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/todos`)
    if (!response.ok) {
      throw new Error(`載入失敗，狀態碼 ${response.status}`)
    }
    const todos: Todo[] = await response.json()
    render(todos)
  } catch (error) {
    console.error("無法載入待辦清單：", error)
    alert("載入失敗，請確認後端伺服器有沒有啟動（npm run dev）")
  }
}

// 新增一筆待辦（POST），成功後重新載入整份清單
async function addTodo(): Promise<void> {
  const text = input.value.trim()
  if (!text) return

  try {
    const response = await fetch(`${API_BASE}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
    if (!response.ok) {
      throw new Error(`新增失敗，狀態碼 ${response.status}`)
    }

    // 新增成功後，重新跟後端拿最新清單，確保畫面跟後端一致
    await loadTodos()

    input.value = ""
    input.focus()
  } catch (error) {
    console.error("新增待辦失敗：", error)
    alert("新增失敗，請稍後再試")
  }
}

addBtn.addEventListener("click", addTodo)
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addTodo()
})

// 啟動：一打開頁面就向後端要資料（而不是讀 localStorage）
loadTodos()
