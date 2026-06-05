// POC V3 後端 — 完整 REST CRUD + 一致的錯誤處理
//
// 相較 V2：補上 GET 單筆 / PUT 更新 / DELETE 刪除，並加上統一的錯誤格式與安全網。
// 資料依然在記憶體陣列裡（永久保存留給 Part 5 接資料庫）。

import express from "express"
import cors from "cors"
import type { Request, Response, NextFunction } from "express"

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

interface Todo {
  id: number
  text: string
  completed: boolean
}

let todos: Todo[] = [{ id: 1, text: "把前後端串起來", completed: true }]
let nextId = 2

// 找出某筆待辦；找不到回傳 undefined。把這段重複邏輯集中成一個小工具。
function findTodo(id: number): Todo | undefined {
  return todos.find((item) => item.id === id)
}

// READ：所有待辦
app.get("/todos", (request, response) => {
  response.json(todos)
})

// READ：單一筆
app.get("/todos/:id", (request, response) => {
  const id = Number(request.params.id)
  const todo = findTodo(id)
  if (!todo) {
    response.status(404).json({ error: `找不到 id 為 ${id} 的待辦` })
    return
  }
  response.json(todo)
})

// CREATE：新增
app.post("/todos", (request, response) => {
  const text: string = request.body.text
  if (!text || text.trim() === "") {
    response.status(400).json({ error: "text 不可為空" })
    return
  }
  const newTodo: Todo = { id: nextId++, text: text.trim(), completed: false }
  todos.push(newTodo)
  response.status(201).json(newTodo)
})

// UPDATE：切換完成狀態
app.put("/todos/:id", (request, response) => {
  const id = Number(request.params.id)
  const todo = findTodo(id)
  if (!todo) {
    response.status(404).json({ error: `找不到 id 為 ${id} 的待辦` })
    return
  }

  const completed = request.body.completed
  // 後端不信任前端送來的型別，先驗證再使用
  if (typeof completed !== "boolean") {
    response.status(400).json({ error: "completed 必須是布林值" })
    return
  }

  todo.completed = completed
  response.json(todo)
})

// DELETE：刪除
app.delete("/todos/:id", (request, response) => {
  const id = Number(request.params.id)
  const index = todos.findIndex((item) => item.id === id)
  if (index === -1) {
    response.status(404).json({ error: `找不到 id 為 ${id} 的待辦` })
    return
  }
  todos.splice(index, 1)
  response.status(204).send() // 成功但沒有內容要回傳
})

// 錯誤處理中介層（安全網）：接住所有沒被預期到的意外，統一回乾淨的 500。
// 一定要有四個參數、掛在所有路由之後，Express 才認得它。
function errorHandler(
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  console.error("未預期的錯誤：", error)
  response.status(500).json({ error: "伺服器發生未預期的錯誤，請稍後再試" })
}

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`後端已啟動，正在 http://localhost:${PORT} 待命`)
})
