# [csharp-7-4] 🔧 動手做：幫 API 加上 JWT 登入與權限控制

> **本章目標**：整合 Part 7 的認證與授權，幫 [csharp-6-6] 的 Todo API 加上「使用者登入 + 每個人只能管自己的待辦 + 管理員能管全部」。

## 你會學到

- 把認證授權整合進真實 API
- 安全地儲存與驗證密碼
- 讓資料「綁定使用者」
- 完整的「登入 → 帶 token → 受保護操作」流程

## 概念說明

### 目標：有使用者系統的 Todo API

把之前的 Todo API（[csharp-6-6]）升級成「**多使用者**」：

```
功能：
   註冊 / 登入（拿 JWT）
   每個使用者只能看/改/刪「自己的」待辦
   管理員（Admin）能管理所有待辦
整合：JWT 認證（csharp-7-2）+ 角色/資源授權（csharp-7-3）
       + 安全的密碼儲存（cs 課程 Part 9-3）
```

## 程式碼範例

### 使用者實體與密碼安全

```csharp
public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = "";
    public string PasswordHash { get; set; } = "";   // 存「雜湊」，絕不存明文密碼！
    public string Role { get; set; } = "User";        // "User" 或 "Admin"
    public List<TodoItem> Todos { get; set; } = new(); // 一對多（csharp-6-5）
}

// TodoItem 加上「屬於誰」
public class TodoItem
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public bool IsDone { get; set; }
    public int UserId { get; set; }       // 外鍵：這個待辦屬於哪個 user（csharp-6-5）
}
```

說明：**最重要——密碼存「雜湊」而非明文**（呼應 cs 課程 Part 9-3、[課外讀物 E-10-6](../../../課外讀物/E-10-security/E-10-6-password-storage.md)）。`TodoItem.UserId` 讓每個待辦「綁定一個使用者」，這是「只能管自己的」的基礎。

### 註冊：雜湊密碼後儲存

```csharp
[AllowAnonymous]
[HttpPost("register")]
public async Task<IActionResult> Register([FromBody] RegisterDto dto)
{
    if (await _db.Users.AnyAsync(u => u.Username == dto.Username))
        return BadRequest("帳號已存在");

    var user = new User
    {
        Username = dto.Username,
        // 用專門的雜湊函式（如 BCrypt）雜湊密碼——絕不存明文！
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
        Role = "User",
    };
    _db.Users.Add(user);
    await _db.SaveChangesAsync();
    return Ok("註冊成功");
}
```

說明：用 **BCrypt**（一個安全的密碼雜湊函式，NuGet 套件）雜湊密碼。**永遠不存明文密碼**——即使資料庫被偷，駭客拿到的也只是雜湊（呼應 cs Part 9-3、E-10-6）。

### 登入：驗證後簽發 JWT

```csharp
[AllowAnonymous]
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginDto dto)
{
    var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
    // 驗證密碼：把輸入的密碼雜湊後，和存的雜湊比對
    if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        return Unauthorized("帳號或密碼錯誤");      // 401（別洩漏「是帳號還密碼錯」）

    // 簽發 JWT（csharp-7-2），放入 userId 和 role
    var token = GenerateJwt(user);     // 含 NameIdentifier=userId, Role=user.Role
    return Ok(new { token });
}
```

說明：用 `BCrypt.Verify` 比對密碼（把輸入的雜湊後比對存的雜湊）。注意錯誤訊息**別洩漏「是帳號錯還密碼錯」**——統一說「帳號或密碼錯誤」，避免攻擊者用它探測哪些帳號存在（資安細節）。驗證通過簽發含 `userId` 和 `role` 的 JWT。

### 受保護的待辦操作：只能管自己的

```csharp
[Authorize]      // 整個 Controller 都需要登入
[ApiController]
[Route("api/todos")]
public class TodosController : ControllerBase
{
    private readonly AppDbContext _db;
    public TodosController(AppDbContext db) => _db = db;

    // 取出當前使用者 id（從 JWT）
    private int CurrentUserId =>
        int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    private bool IsAdmin => User.IsInRole("Admin");

    // 列出「自己的」待辦（管理員看全部）
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var query = _db.Todos.AsQueryable();
        if (!IsAdmin)
            query = query.Where(t => t.UserId == CurrentUserId);   // 非管理員只看自己的
        var todos = await query.Select(t => new TodoDto(t.Id, t.Title, t.IsDone)).ToListAsync();
        return Ok(todos);
    }

    // 新增：自動綁定當前使用者
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTodoDto dto)
    {
        var todo = new TodoItem { Title = dto.Title, UserId = CurrentUserId };  // 綁定自己
        _db.Todos.Add(todo);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = todo.Id },
            new TodoDto(todo.Id, todo.Title, todo.IsDone));
    }

    // 刪除：只能刪自己的（管理員例外）
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var todo = await _db.Todos.FindAsync(id);
        if (todo == null) return NotFound();
        if (todo.UserId != CurrentUserId && !IsAdmin)
            return Forbid();        // 403：不是你的，也不是管理員 → 不准
        _db.Todos.Remove(todo);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
```

說明：整合了全部——`[Authorize]`（需登入，[csharp-7-2]）、從 JWT 取 `CurrentUserId` 和角色、**新增時綁定自己、查/刪時只能動自己的（管理員例外）**（[csharp-7-3] 的資源授權）。這就是真實多使用者 API 的權限控制。

### 完整流程測試

```
1. POST /api/register {username, password} → 註冊（密碼被雜湊存）
2. POST /api/login {username, password} → 拿到 JWT
3. 帶 JWT：POST /api/todos {title} → 新增（綁定你）
4. 帶 JWT：GET /api/todos → 只看到「你的」待辦
5. 用「另一個帳號」的 JWT 嘗試刪你的待辦 → 403 Forbidden ✓
6. 不帶 JWT → 401 Unauthorized ✓
```

走完這流程，你就有一個**有完整認證授權的多使用者 API**了！

## 小練習

1. 把這個有使用者系統的 Todo API 整合起來，走完「註冊 → 登入 → 帶 token 操作」流程。
2. 驗證安全性：用 A 帳號的 token 嘗試刪 B 帳號的待辦，確認回 403。
3. 思考題：為什麼登入失敗的訊息要統一說「帳號或密碼錯誤」，而非分別說「帳號不存在」/「密碼錯」？

## 課外讀物

> 密碼儲存（雜湊、加鹽）、Web 安全 → [課外讀物 E-10-6：密碼儲存](../../../課外讀物/E-10-security/E-10-6-password-storage.md)、[課外讀物 E-10：Web Security](../../../課外讀物/E-10-security/E-10-1-web-security-overview.md)

> 加密與雜湊原理 → **cs 課程 Part 9-3**；認證授權 → [csharp-7-1]~[csharp-7-3]

> 本 Part 完成！下一步：為你的服務寫測試 → [csharp-8-1]
