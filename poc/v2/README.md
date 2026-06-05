# POC V2 — 前後端通了！

> **解鎖條件**：完成 Part 4-A（HTTP / Express / fetch）後

這是你的 Todo App 第一次有了「後端」。雖然資料還只是暫存在後端的記憶體裡（重啟就消失），但架構上已經是**前後端分離**了——這是邁向真正全端應用的第一步。

---

## 這個版本做了什麼

把 V1 那個「資料只存在自己瀏覽器」的 Todo App，改成「資料存在後端伺服器」：

- 前端用 `fetch` 向後端要待辦清單（`GET /todos`）
- 前端用 `fetch` 把新待辦送給後端（`POST /todos`）
- 後端用 Express 提供這兩個 API，資料存在一個記憶體陣列裡

---

## 相較於 V1 的改變

- **新增**：一個完整的後端（`backend/`），用 Express 提供 Todo API
- **新增**：前端改用 `fetch` + `async/await` 跟後端溝通
- **修改**：資料來源從 `localStorage` 換成「後端的記憶體陣列」
- **移除**：前端不再直接碰 `localStorage`（資料的家搬到後端了）
- **暫時拿掉**：勾選完成、刪除——這些需要 `PUT` / `DELETE`，是 **V3 完整 CRUD** 的主題

```
V1 架構                          V2 架構
┌─────────────┐                 ┌──────────┐   HTTP    ┌──────────────┐
│  瀏覽器      │                 │  前端     │ ────────> │  後端         │
│  localStorage│                │ (fetch)  │ <──────── │  server.ts   │
└─────────────┘                 └──────────┘   JSON     │ (記憶體陣列)  │
資料綁在這台瀏覽器                                        └──────────────┘
                                資料的家搬到後端了
```

---

## 為什麼這是進步？（也別忘了它的限制）

**進步**：資料離開了「單一台瀏覽器」。理論上現在多台裝置連到同一個後端，就能看到同一份資料——這是 V1 的 `localStorage` 永遠做不到的。

**還有的限制**：後端的資料只放在記憶體陣列裡，**伺服器一重啟就全部消失**。要讓資料真正永久保存，得等 Part 5 接上資料庫（V6）。V2 先專注把「前後端的溝通管道」打通。

---

## 如何跑起來

V2 有前後端兩部分，要**開兩個終端機**分別啟動。

### 第一步：啟動後端

```bash
cd poc/v2/backend
npm install
npm run dev
```

看到 `後端已啟動，正在 http://localhost:3000 待命` 就成功了。**這個終端機留著別關**。

### 第二步：編譯並打開前端

開**另一個**終端機：

```bash
cd poc/v2/frontend
npm install
npm run build      # 把 src/main.ts 編譯成 dist/main.js
```

然後用瀏覽器打開 `frontend/index.html`（雙擊，或用 VS Code 的 Live Server）。

> **提示**：如果前端用 `file://` 直接開撞到 CORS 錯誤，後端已經加了 `app.use(cors())` 先放行；CORS 的完整原理留到 Part 4-C。

開發時前端也可以另開終端機跑 `npm run dev`（watch 模式，存檔自動重編）。

---

## 專案結構

```
poc/v2/
├── README.md
├── backend/                 # 後端：Express API
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── server.ts        # GET /todos、POST /todos
└── frontend/                # 前端：fetch + DOM
    ├── package.json
    ├── tsconfig.json
    ├── index.html
    ├── style.css
    └── src/
        └── main.ts          # loadTodos()、addTodo()
```

> 三個核心檔案：`frontend/index.html`、`frontend/src/main.ts`、`backend/src/server.ts`——對應大綱說的「3 個檔案」。其餘是讓它跑起來的設定檔。

---

## 跑起來後，驗證一下「資料真的在後端」

1. 新增幾筆待辦，然後**重新整理頁面**——資料還在（因為是跟後端拿的）。
2. 用 `curl` 直接問後端，確認你新增的真的存進去了：
   ```bash
   curl http://localhost:3000/todos
   ```
3. **重啟後端**（在後端終端機按 `Ctrl+C` 再 `npm run dev`），重新整理前端——待辦回到只剩預設那筆。這就親眼驗證了「記憶體陣列重啟就消失」的限制，也說明了為什麼之後需要資料庫。

---

## 學到了什麼

- 後端伺服器就是一支「一直待命、有請求就回應」的程式
- 前後端用 HTTP 溝通：`GET` 拿資料、`POST` 送資料
- 前端用 `fetch` + `async/await` 呼叫後端，並用 `try/catch` 處理失敗
- 「前後端分離」的真正意義：資料不再綁在單一瀏覽器
- 記憶體存資料的限制 → 預告 Part 5 為什麼需要資料庫

---

## 下一步（V3 會做什麼）

V2 只做了「列出」和「新增」。下一版 **V3** 會補齊完整的 REST CRUD：

- 用 `PUT` 切換待辦的完成狀態
- 用 `DELETE` 刪除待辦
- 認識完整的狀態碼設計與錯誤處理

> 解鎖條件：完成 Part 4-B（REST API 設計）後。
