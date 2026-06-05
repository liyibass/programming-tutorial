// POC V2 後端 — 用 Express 提供 Todo API
//
// 跟 V1 最大的差別：資料不再存在瀏覽器的 localStorage，而是存在「這支伺服器」上。
// 但注意——這版資料只放在下面這個記憶體陣列裡，伺服器一重啟就全部消失。
// 「資料怎麼永久保存」是 Part 5 接上資料庫才會解決的事，V2 先專注在「前後端通了」。

import express from "express"
import cors from "cors"

const app = express()
const PORT = 3000

// 允許前端（不同來源）跨來源請求。開發階段先全開，正式環境的正確設定見 Part 4-C。
app.use(cors())

// 讓 Express 自動把進來的 JSON Body 解析成物件；少了這行，request.body 會是 undefined。
app.use(express.json())

// 一筆待辦的形狀。前後端對「資料長什麼樣」要有共識，溝通才不會出錯。
// （V4 會把這個型別抽出來給前後端「共用」，現在先各自定義。）
interface Todo {
  id: number
  text: string
  completed: boolean
}

// 暫存資料的記憶體陣列。這就是 V2 的「資料庫替身」。
let todos: Todo[] = [{ id: 1, text: "把前後端串起來", completed: false }]
let nextId = 2

// 取得所有待辦
app.get("/todos", (request, response) => {
  response.json(todos)
})

// 新增一筆待辦
app.post("/todos", (request, response) => {
  const text: string = request.body.text

  // 後端不能信任前端送來的東西，最基本的檢查不能少
  if (!text || text.trim() === "") {
    // 400 代表「你（前端）送來的請求有問題」
    response.status(400).json({ error: "text 不可為空" })
    return
  }

  const newTodo: Todo = { id: nextId++, text: text.trim(), completed: false }
  todos.push(newTodo)

  // 201 代表「成功，而且建立了新資源」；回傳剛建立、帶 id 的那筆給前端
  response.status(201).json(newTodo)
})

app.listen(PORT, () => {
  console.log(`後端已啟動，正在 http://localhost:${PORT} 待命`)
})
