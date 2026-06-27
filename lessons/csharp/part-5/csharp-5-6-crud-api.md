# [csharp-5-6] 🔧 動手做：做一個完整的 CRUD REST API

> **本章目標**：整合 Part 4-5 學的一切，動手做一個完整的「待辦事項」CRUD REST API（先用記憶體存資料，Part 6 再接資料庫）。

## 你會學到

- 把 Controller、DTO、驗證、狀態碼整合成完整 API
- 實作完整的 CRUD 五個操作
- 用記憶體當「暫時的資料儲存」
- 為接資料庫（Part 6）打好基礎

## 概念說明

### 目標：Todo CRUD API

我們要做一個待辦事項的完整 REST API，整合 Part 4-5 全部：

```
GET    /api/todos      → 列出所有待辦（200）
GET    /api/todos/{id} → 查單一（200 / 404）
POST   /api/todos      → 新增（201 / 400）
PUT    /api/todos/{id} → 更新（204 / 404 / 400）
DELETE /api/todos/{id} → 刪除（204 / 404）
```

資料先**存在記憶體**（一個 `List`）——這樣能專注在「API 設計」本身，[csharp-6] 再把它換成真資料庫（屆時 Controller 幾乎不用改，因為我們會用好的架構）。

## 程式碼範例

### 模型與 DTO

```csharp
// === 領域模型（之後會變成資料庫實體，csharp-6）===
public class TodoItem
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public bool IsDone { get; set; }
    public DateTime CreatedAt { get; set; }
}

// === DTO：對外的形狀（csharp-5-4）===
public record TodoDto(int Id, string Title, bool IsDone);

// === 接收新增/更新的 DTO + 驗證（csharp-5-2）===
public record CreateTodoDto(
    [property: Required, StringLength(100, MinimumLength = 1)] string Title);

public record UpdateTodoDto(
    [property: Required, StringLength(100, MinimumLength = 1)] string Title,
    bool IsDone);
```

說明：`TodoItem` 是內部模型、`TodoDto` 是對外回傳、`CreateTodoDto`/`UpdateTodoDto` 是接收用——各司其職（[csharp-5-4]）。接收的 DTO 加了驗證屬性（[csharp-5-2]）。

### 完整的 Controller

```csharp
[ApiController]
[Route("api/todos")]
public class TodosController : ControllerBase
{
    // 暫時用 static List 存（記憶體）；csharp-6 換成資料庫
    private static readonly List<TodoItem> _todos = new();
    private static int _nextId = 1;

    // === R：列出全部 → 200 ===
    [HttpGet]
    public IActionResult GetAll()
    {
        var dtos = _todos.Select(t => new TodoDto(t.Id, t.Title, t.IsDone));  // LINQ 映射（csharp-3-2）
        return Ok(dtos);
    }

    // === R：查單一 → 200 / 404 ===
    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var todo = _todos.FirstOrDefault(t => t.Id == id);
        if (todo == null)
            return NotFound();                  // 404
        return Ok(new TodoDto(todo.Id, todo.Title, todo.IsDone));
    }

    // === C：新增 → 201 / 400(自動驗證) ===
    [HttpPost]
    public IActionResult Create([FromBody] CreateTodoDto dto)
    {
        var todo = new TodoItem
        {
            Id = _nextId++,
            Title = dto.Title,
            IsDone = false,
            CreatedAt = DateTime.UtcNow,
        };
        _todos.Add(todo);
        var result = new TodoDto(todo.Id, todo.Title, todo.IsDone);
        return CreatedAtAction(nameof(GetById), new { id = todo.Id }, result);  // 201
    }

    // === U：更新 → 204 / 404 / 400 ===
    [HttpPut("{id}")]
    public IActionResult Update(int id, [FromBody] UpdateTodoDto dto)
    {
        var todo = _todos.FirstOrDefault(t => t.Id == id);
        if (todo == null)
            return NotFound();
        todo.Title = dto.Title;
        todo.IsDone = dto.IsDone;
        return NoContent();                     // 204
    }

    // === D：刪除 → 204 / 404 ===
    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var todo = _todos.FirstOrDefault(t => t.Id == id);
        if (todo == null)
            return NotFound();
        _todos.Remove(todo);
        return NoContent();                     // 204
    }
}
```

說明：這個 Controller 整合了全部——**路由（[csharp-5-1]）、Model Binding + 驗證（[csharp-5-2]）、RESTful + 狀態碼（[csharp-5-3]）、DTO 映射（[csharp-5-4]）、LINQ（[csharp-3-2]）**。每個操作回傳對的狀態碼，接收的資料自動驗證。

### 測試你的 API

```bash
dotnet run
# 打開 /swagger，依序測試：
#   POST /api/todos  body: {"title": "學 C#"}  → 201
#   GET  /api/todos                            → 200 看到剛建的
#   PUT  /api/todos/1  body: {"title":"學 C#", "isDone":true}  → 204
#   GET  /api/todos/1                          → 200 看到 isDone=true
#   DELETE /api/todos/1                        → 204
#   GET  /api/todos/1                          → 404（已刪）
```

走一遍完整 CRUD，你就有一個能運作的 REST API 了！這和 **rust 課程 [rust-9-6]** 的 Todo API 是同一個東西、不同語言——對照學會發現概念全通。

> ⚠️ 注意：這裡用 `static List` 存資料只是「暫時」——程式一重啟資料就沒了，且多執行緒下 static 共用有並行風險（cs 課程 Part 5-5）。Part 6 會換成真正的資料庫解決這些。

## 小練習

1. 把這個 Todo CRUD API 完整打出來、用 Swagger 走一遍五個操作，確認狀態碼都對。
2. 加一個端點 `GET /api/todos?done=true`——用 `[FromQuery] bool? done` 篩選「只看已完成/未完成」（提示：LINQ 的 Where）。
3. 觀察：重啟 `dotnet run` 後，之前新增的待辦不見了——想想為什麼（記憶體 vs 持久化），這正是 Part 6 要解決的。

## 課外讀物

> 整合的觀念 → 複習 [csharp-5-1]~[csharp-5-5]；對照 Rust 的 Todo API → **rust 課程 [rust-9-6]**

> 為什麼需要資料庫（記憶體會消失）→ **cs 課程 Part 3-5（RAM 揮發性）**、下一個 Part

> 本 Part 完成！下一步：把資料存進真正的資料庫 → [csharp-6-1]
