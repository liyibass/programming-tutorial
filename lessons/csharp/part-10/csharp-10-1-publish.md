# [csharp-10-1] 發佈（Publish）你的 .NET 應用

> **本章目標**：學會把開發中的 .NET 專案「發佈」成可部署的產物，理解 Debug 與 Release 的差別，為部署上線做準備。

## 你會學到

- 「發佈（publish）」是什麼、和 build 的差別
- Debug vs Release 組態
- `dotnet publish` 怎麼用
- 框架相依 vs 自包含部署

## 概念說明

### 從「開發」到「可部署」

你開發時用 `dotnet run`（[csharp-0-3]）。但要**部署到伺服器**，需要把專案打包成「**最佳化、可獨立執行的產物**」——這個動作叫**發佈（publish）**。

```
dotnet run / build：開發用，產出「Debug 版」（含除錯資訊、未最佳化）
dotnet publish：部署用，產出「Release 版」（最佳化、精簡，準備好上線的檔案）
```

這呼應 **rust 課程 [rust-9-6]** 的 `cargo build --release`——同樣是「把開發版變成最佳化的上線版」。

### Debug vs Release

```
Debug（開發組態）：
   含完整除錯資訊、不做最佳化 → 方便除錯，但較慢、檔案大
Release（正式組態）：
   做最佳化、去除除錯資訊 → 跑得快、檔案精簡 → 上線用這個
→ 部署一定要用 Release 版！（Debug 版上線 = 慢 + 洩漏除錯資訊）
```

## 程式碼範例

### dotnet publish

```bash
# 發佈成 Release 版
dotnet publish -c Release -o ./publish

# -c Release：用 Release 組態（最佳化）
# -o ./publish：輸出到 publish 資料夾
```

說明：這會編譯成 Release 版、把程式和它需要的東西收集到 `./publish` 資料夾。裡面是「**可以丟到伺服器執行的完整產物**」——包含你的 DLL、設定檔、相依套件等。

執行發佈後的產物：

```bash
cd publish
dotnet MyApi.dll        # 用 dotnet 執行發佈的應用
```

### 框架相依 vs 自包含

發佈有兩種模式，差別在「目標機器要不要先裝 .NET」：

```mermaid
graph TB
    FD["框架相依 (Framework-dependent)<br/>產物較小，但目標機器要先裝 .NET Runtime<br/>(預設、最常見)"]
    SC["自包含 (Self-contained)<br/>把 .NET Runtime 一起打包進去<br/>產物大，但目標機器『不用裝 .NET』也能跑"]
```

```bash
# 框架相依（預設）：較小，但伺服器要有 .NET Runtime
dotnet publish -c Release

# 自包含：把 runtime 打包進去，伺服器不用裝 .NET（指定目標平台）
dotnet publish -c Release --self-contained -r linux-x64
```

說明：

- **框架相依**：產物小，但部署的伺服器要先裝對應的 .NET Runtime（[csharp-0-2]）。
- **自包含**：把 Runtime 一起打包，產物大但「**目標機器什麼都不用裝**」就能跑。

**現代部署其實常用 Docker（[csharp-10-2]）**——把應用和環境一起打包成 image，就不用煩惱「目標機器有沒有裝 .NET」這個問題了。所以下一章的容器化是更主流的做法。

### 發佈前的檢查清單

```
□ 用 Release 組態（-c Release）
□ 機密不在產物裡（走環境變數/密鑰服務，csharp-9-3）
□ 設定正確的環境（appsettings.Production.json，csharp-4-5）
□ 測試都通過（dotnet test，csharp-8）
□ 正式環境關掉 Swagger 等開發工具（csharp-4-2）
```

## 小練習

1. 用 `dotnet publish -c Release -o ./publish` 發佈你的 API，看 publish 資料夾裡有什麼。
2. 用 `dotnet MyApi.dll` 執行發佈後的產物，確認能跑。
3. 思考題：為什麼部署要用 Release 而非 Debug 版？「框架相依」和「自包含」各適合什麼情境？

## 課外讀物

> 對照 Rust 的 release 發佈 → **rust 課程 [rust-9-6]**；編譯最佳化 → **cs 課程 Part 4-3**

> 機密、環境設定 → [csharp-9-3]、[csharp-4-5]

> 下一步：把應用容器化成 Docker image → [csharp-10-2]
