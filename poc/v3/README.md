# POC V3 — 完整 REST CRUD

> **解鎖條件**：完成 Part 4-B（REST API 設計）後

V2 證明了「前後端能通」，V3 要證明「這個 API 設計得專業」——遵守 REST 慣例、回對狀態碼、用一致的方式處理錯誤。你的 Todo App 到這版功能終於完整了。

---

## 這個版本做了什麼

一個功能完整、設計符合 REST 慣例的 Todo App：

- **新增** 待辦（`POST /todos` → 201）
- **列出** 所有待辦（`GET /todos` → 200）
- **勾選 / 取消完成**（`PUT /todos/:id` → 200）
- **刪除** 待辦（`DELETE /todos/:id` → 204）
- 一致的錯誤格式（永遠是 `{ "error": "..." }`）與錯誤處理中介層（安全網）
- 每個操作都回傳語意正確的狀態碼

---

## 相較於 V2 的改變

- **新增**：`PUT /todos/:id`（切換完成）和 `DELETE /todos/:id`（刪除）兩個端點
- **新增**：前端的勾選 checkbox 與刪除按鈕（V2 暫時拿掉的功能回來了，而且這次是透過後端）
- **新增**：統一的錯誤處理中介層，接住所有未預期的意外，回乾淨的 500
- **新增**：後端對前端送來的資料做型別驗證（例如 `completed` 必須是布林值）
- **改善**：每個端點回傳語意正確的狀態碼，而非一律 200

```
V2：只能 列出 / 新增
V3：列出 / 新增 / 勾選 / 刪除 — 完整 CRUD
```

---

## REST API 設計總覽

```
方法     網址            意義              成功狀態碼   失敗狀態碼
──────────────────────────────────────────────────────────────
GET     /todos          取得所有待辦       200
GET     /todos/:id      取得單一筆         200        404
POST    /todos          新增              201        400
PUT     /todos/:id      切換完成           200        404 / 400
DELETE  /todos/:id      刪除              204        404
（任何未預期的意外 → 500，由錯誤處理中介層統一處理）
```

整個 API 只有兩個網址（`/todos` 與 `/todos/:id`），靠 HTTP 方法區分操作——這就是 REST 的優雅。

---

## 如何跑起來

跟 V2 一樣，需要**開兩個終端機**。

### 第一步：啟動後端

```bash
cd poc/v3/backend
npm install
npm run dev
```

看到 `後端已啟動，正在 http://localhost:3000 待命` 即成功，終端機留著。

### 第二步：編譯並打開前端

開另一個終端機：

```bash
cd poc/v3/frontend
npm install
npm run build
```

用瀏覽器打開 `frontend/index.html`。

---

## 專案結構

```
poc/v3/
├── README.md
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── server.ts        # 完整 CRUD + 錯誤處理中介層
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── index.html
    ├── style.css
    └── src/
        └── main.ts          # loadTodos / addTodo / toggleTodo / deleteTodo
```

---

## 用 curl 完整測一輪 CRUD

後端跑著時，在另一個終端機：

```bash
# 新增（預期 201）
curl -i -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" -d '{"text":"買牛奶"}'

# 列出（預期 200）
curl http://localhost:3000/todos

# 切換完成（預期 200，把 id 換成上面新增到的那筆）
curl -i -X PUT http://localhost:3000/todos/2 \
  -H "Content-Type: application/json" -d '{"completed":true}'

# 刪除（預期 204）
curl -i -X DELETE http://localhost:3000/todos/2

# 故意打錯：找不存在的 id（預期 404）
curl -i http://localhost:3000/todos/999

# 故意打錯：新增空字串（預期 400）
curl -i -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" -d '{"text":""}'
```

留意每個回應的狀態碼——這就是一個設計良好的 REST API 該有的樣子。

---

## 學到了什麼

- 用 REST 慣例設計 API：網址用名詞，操作交給 HTTP 方法
- CRUD 與 HTTP 方法的對應（POST/GET/PUT/DELETE）
- 用對狀態碼表達「成功 / 前端錯 / 後端錯」
- 一致的錯誤格式如何讓前端的錯誤處理變簡單
- 錯誤處理中介層作為整個伺服器的安全網

---

## 還有的限制（V4 之後會解決）

- **資料還在記憶體**：重啟後端，待辦回到預設那筆。永久保存要等 Part 5 接資料庫（V6）。
- **前後端型別各寫一份**：`interface Todo` 在前端和後端各定義了一次，容易不同步。V4 會引入 Vite 與「共用型別」來解決。
- **前端還要手動 `npm run build`**：V4 的 Vite 會讓開發體驗順很多。

> 下一版 **V4** 解鎖條件：完成 Part 4-C（引入工具鏈）後。
