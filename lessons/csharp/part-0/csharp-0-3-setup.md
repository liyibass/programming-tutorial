# [csharp-0-3] 🔧 動手做：裝好 .NET SDK + 編輯器，跑出第一個程式

> **本章目標**：實際把 .NET 開發環境裝起來，學會用 `dotnet` 指令建專案、執行，並寫出你的第一個 C# 程式。

## 你會學到

- 怎麼安裝 .NET SDK（跨平台）
- `dotnet` CLI 的基本指令
- 建立、執行第一個 C# 專案
- 看懂專案的基本結構

## 概念說明

### 你需要兩樣東西

```
① .NET SDK：開發工具包（[csharp-0-2] 說過，含編譯器、CLI、Runtime）
② 一個編輯器：寫程式碼用
   - VS Code：免費、跨平台、輕量（裝「C# Dev Kit」擴充套件）
   - Visual Studio：功能最全（Windows/Mac，較重）
   - Rider：JetBrains 出品（付費，很好用）
→ 新手推薦「VS Code + C# Dev Kit」，輕量又跨平台。
```

`dotnet` 是 .NET 的命令列工具（CLI），類似你在 **rust 課程**用的 `cargo`、basic 用的 `npm`——一條龍幫你建專案、編譯、執行、管套件。

## 程式碼範例

### 步驟一：安裝 .NET SDK

到官方網站 <https://dotnet.microsoft.com/download> 下載安裝對應你系統的 **.NET SDK**（選最新的長期支援版 LTS）。

- **Windows / Mac**：下載安裝程式跑一跑。
- **Linux / WSL**：照官網的套件管理器指令安裝（推薦用 WSL，和本系列其他課程一致）。

> 想在 Windows 用 Linux 環境開發 → **infra 課程 Part 0：WSL 介紹**

裝完，**開一個新終端機**確認：

```bash
dotnet --version
```

印出版本號（例如 `8.0.x`）就代表裝好了。

### 步驟二：建立第一個專案

`dotnet` 用「範本」快速建專案。先建一個最簡單的「主控台（console）」程式：

```bash
dotnet new console -o HelloCSharp
cd HelloCSharp
```

`dotnet new console` 建一個主控台應用，`-o HelloCSharp` 指定資料夾名。它產生的結構：

```
HelloCSharp/
├── HelloCSharp.csproj    # 專案設定檔（像 package.json / Cargo.toml）
├── Program.cs            # 程式進入點（已幫你寫好 Hello World）
└── obj/ bin/             # 編譯產物（自動產生，不該進 Git）
```

打開 `Program.cs`，你會看到（現代 C# 的精簡寫法）：

```csharp
// 現代 C# 的「頂層語句」——一行就能跑
Console.WriteLine("Hello, World!");
```

逐項說明：

- `Console.WriteLine(...)`：印一行字到主控台（`Console` 是 .NET 標準庫的類別，`WriteLine` 是它的方法）。
- 字串結尾要有 **分號 `;`**——C# 每行敘述都用分號結束。
- 這是 .NET 6 起的「頂層語句」精簡寫法。傳統寫法要包在 `class` 和 `Main` 方法裡（[csharp-1-1] 會看到），但新版可以這樣直接寫。

### 步驟三：執行

```bash
dotnet run
```

`dotnet run` 會**編譯 + 執行**（像 `cargo run`），你會看到：

```
Hello, World!
```

恭喜，你的第一個 C# 程式跑起來了！

### 認識常用的 dotnet 指令

| 指令 | 做什麼 |
|------|--------|
| `dotnet new <範本>` | 用範本建專案（console、webapi…）|
| `dotnet run` | 編譯 + 執行 |
| `dotnet build` | 只編譯，不執行 |
| `dotnet add package <名稱>` | 加一個 NuGet 套件（.NET 的套件，類似 npm）|
| `dotnet test` | 跑測試（[csharp-8] 會用）|

> `.NET` 的套件叫 **NuGet 套件**，從 nuget.org 下載——和 npm、crates.io 概念相通（[課外讀物 E-2](../../../課外讀物/E-2-npm/E-2-1-npm-intro.md)）。`obj/`、`bin/` 是編譯產物，記得加進 `.gitignore`（[課外讀物 E-8](../../../課外讀物/E-8-git/E-8-1-git-internals.md)）。

## 小練習

1. 完整跑一遍：裝好 SDK、`dotnet new console`、改 `Program.cs` 印出你的名字、`dotnet run`。
2. 在 `Program.cs` 多加幾行 `Console.WriteLine`，印出三行不同的字，確認每行都要分號。
3. 故意刪掉一行的分號，`dotnet build` 看看編譯器的錯誤訊息——習慣去讀它（這是學任何語言的重要技能）。

## 課外讀物

> NuGet 套件生態（與 npm 相通）→ [課外讀物 E-2：npm 與套件生態](../../../課外讀物/E-2-npm/E-2-1-npm-intro.md)

> 哪些檔案不該進 Git（如 bin/、obj/）→ [課外讀物 E-8：Git 版本控制](../../../課外讀物/E-8-git/E-8-1-git-internals.md)

> 在 WSL 上開發 → **infra 課程 Part 0：WSL 介紹**

> 本 Part 完成！下一步：進入 C# 語言基礎 → [csharp-1-1]
