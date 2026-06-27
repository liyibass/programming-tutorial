# [csharp-5-1] Controller 與路由（Routing）

> **本章目標**：學會用 Controller 處理 HTTP 請求，以及路由怎麼把「網址 + 方法」對應到「處理它的程式碼」。

## 你會學到

- Controller 是什麼、怎麼定義
- Action：處理特定請求的方法
- 路由屬性：把網址對應到 Action
- 怎麼從網址取參數

## 概念說明

### Controller：請求的處理中心

在 ASP.NET Core，**Controller** 是「**負責處理某一類請求的 class**」。例如處理「使用者」相關請求的 `UsersController`、處理「待辦」的 `TodosController`。Controller 裡的方法叫 **Action**——每個 Action 處理一個特定的請求。

```
比喻（呼應 cs 課程 Part 6-1 的 client-server）：
   Controller 像「部門」（使用者部門、訂單部門）
   Action 像「部門裡的窗口」（查詢窗口、新增窗口）
   路由像「總機」：依你打的網址，把請求轉給對的部門的對的窗口
```

這對應 **basic 課程 Part 4** 的 Express route handler、**rust 課程 [rust-9-2]** 的 Axum handler——同樣是「處理請求的程式碼」，ASP.NET Core 用 Controller 把它們結構化組織。

### 路由：網址 → Action

**路由（routing）** 決定「**哪個網址 + HTTP 方法，由哪個 Action 處理**」（呼應 [rust-9-2]、cs Part 6-4）。ASP.NET Core 用「**屬性路由**」——直接在 Controller/Action 上用屬性標註：

```
[Route("api/users")]  標在 Controller → 這個 Controller 管 /api/users
[HttpGet]             標在 Action → 處理 GET 請求
[HttpGet("{id}")]     → 處理 GET /api/users/{id}
[HttpPost]            → 處理 POST 請求
```

## 程式碼範例

### 一個基本的 Controller

```csharp
using Microsoft.AspNetCore.Mvc;

[ApiController]                       // 標記這是 API Controller（啟用便利功能）
[Route("api/users")]                  // 這個 Controller 的基礎路由
public class UsersController : ControllerBase   // 繼承 ControllerBase
{
    // GET /api/users → 列出所有使用者
    [HttpGet]
    public IActionResult GetAll()
    {
        var users = new[] { "Amy", "Bob", "Cathy" };
        return Ok(users);             // 回傳 200 OK + 資料（自動轉成 JSON）
    }

    // GET /api/users/5 → 查單一使用者
    [HttpGet("{id}")]
    public IActionResult GetById(int id)        // id 從網址自動取出
    {
        if (id < 1)
            return BadRequest("id 必須大於 0");   // 400

        return Ok($"使用者 {id}");
    }

    // POST /api/users → 新增使用者
    [HttpPost]
    public IActionResult Create([FromBody] string name)   // 從請求 body 取資料
    {
        return CreatedAtAction(nameof(GetById), new { id = 1 }, name);  // 201
    }
}
```

逐項說明：

- `[ApiController]`：標記為 API Controller，啟用自動模型驗證等便利功能（[csharp-5-2]）。
- `[Route("api/users")]`：這個 Controller 處理 `/api/users` 開頭的請求。
- `ControllerBase`：API Controller 繼承它（拿到 `Ok()`、`BadRequest()` 等便利方法）。
- **`[HttpGet]` / `[HttpPost]`**：標記 Action 處理哪種 HTTP 方法。
- `[HttpGet("{id}")]`：路由含參數 `{id}`，會自動對應到 Action 的 `int id` 參數（路徑參數）。
- **回傳輔助方法**：`Ok(資料)`→200、`BadRequest()`→400、`CreatedAtAction()`→201——回傳對應的 HTTP 狀態碼 + 資料（[csharp-5-3] 詳講狀態碼）。資料會自動序列化成 JSON。

### 取得各種參數

```csharp
// 路徑參數：/api/users/5 的 5
[HttpGet("{id}")]
public IActionResult Get(int id) { ... }

// 查詢字串：/api/users?page=2&size=10
[HttpGet]
public IActionResult List([FromQuery] int page, [FromQuery] int size) { ... }

// 請求 body（POST/PUT 的 JSON）
[HttpPost]
public IActionResult Create([FromBody] CreateUserDto dto) { ... }
```

說明：ASP.NET Core 用 `[FromRoute]`（路徑，預設）、`[FromQuery]`（查詢字串）、`[FromBody]`（請求 body）告訴它「參數從哪來」。它會自動「綁定」並轉型（[csharp-5-2] Model Binding 詳講）——你不用手動解析網址，框架幫你準備好。

跑起來後，Swagger（[csharp-4-2]）會自動列出這些端點，可以直接測！

## 小練習

1. 建一個 `ProductsController`（路由 `api/products`），加 `GetAll`（GET，回傳一個商品陣列）和 `GetById`（GET `{id}`）兩個 Action，用 Swagger 測試。
2. 加一個 `[HttpGet]` 的 Action 用 `[FromQuery]` 接收 `page` 參數，回傳「第 X 頁」。
3. 思考題：路由 `[HttpGet("{id}")]` 裡的 `{id}` 怎麼對應到 Action 的參數？這和 rust 課程 [rust-9-3] 的 `Path` 提取器有什麼相似？

## 課外讀物

> 對照其他框架的路由/handler → **basic 課程 Part 4**、**rust 課程 [rust-9-2]、[rust-9-3]**

> 請求路由的全貌 → [csharp-4-3] 中介軟體、**cs 課程 Part 6-4**

> 下一步：自動綁定參數與資料驗證 → [csharp-5-2]
