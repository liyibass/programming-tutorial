# [csharp-1-6] 🔧 動手做：寫一個 C# CLI 小工具

> **本章目標**：把 Part 1 學的語言基礎整合起來，動手做一個「待辦清單」命令列小工具，實際體驗用 C# 寫一個能跑的程式。

## 你會學到

- 把變數、集合、迴圈、方法整合成一個程式
- 讀取使用者輸入
- 設計一個簡單的互動式 CLI
- 為後面的後端開發暖身

## 概念說明

### 目標：一個待辦清單 CLI

我們要做一個在終端機跑的「待辦清單」工具，功能：

```
1. 顯示選單（新增 / 列出 / 完成 / 離開）
2. 使用者輸入指令 → 執行對應操作
3. 用一個 List 存待辦事項
4. 迴圈直到使用者選擇離開
```

這會用到 Part 1 的全部：**變數型別（[csharp-1-2]）、流程控制（[csharp-1-3]）、方法（[csharp-1-4]）、集合 List（[csharp-1-5]）**，加上「讀取使用者輸入」這個新技能。

### 讀取輸入：Console.ReadLine

```csharp
Console.Write("請輸入：");
string? input = Console.ReadLine();    // 讀一行使用者輸入
```

說明：`Console.ReadLine()` 讀使用者打的一行字，回傳 `string?`——**那個 `?` 表示「可能是 null」**（如果沒有輸入）。這是 C# 的「可空參考型別」（[csharp-3-6] 詳講），現在先知道要處理一下 null。

## 程式碼範例

完整的待辦清單 CLI（`Program.cs`）：

```csharp
List<string> todos = new List<string>();   // 用 List 存待辦（csharp-1-5）

bool running = true;
while (running)                             // 主迴圈，直到使用者離開（csharp-1-3）
{
    Console.WriteLine("\n=== 待辦清單 ===");
    Console.WriteLine("1) 新增  2) 列出  3) 完成  4) 離開");
    Console.Write("選擇：");
    string? choice = Console.ReadLine();

    switch (choice)                        // 依選擇分支（csharp-1-3 switch）
    {
        case "1":
            Console.Write("輸入待辦內容：");
            string? task = Console.ReadLine();
            if (!string.IsNullOrWhiteSpace(task))   // 檢查不是空的
            {
                todos.Add(task);                     // 加進 List
                Console.WriteLine($"已新增：{task}");
            }
            break;

        case "2":
            ShowTodos(todos);              // 呼叫方法（csharp-1-4）
            break;

        case "3":
            Console.Write("輸入要完成的編號：");
            if (int.TryParse(Console.ReadLine(), out int index)
                && index >= 1 && index <= todos.Count)
            {
                Console.WriteLine($"已完成：{todos[index - 1]}");
                todos.RemoveAt(index - 1);           // 移除該項
            }
            else
            {
                Console.WriteLine("無效的編號");
            }
            break;

        case "4":
            running = false;              // 結束主迴圈
            Console.WriteLine("掰掰！");
            break;

        default:
            Console.WriteLine("請輸入 1-4");
            break;
    }
}

// 一個方法：列出所有待辦（csharp-1-4）
void ShowTodos(List<string> list)
{
    if (list.Count == 0)
    {
        Console.WriteLine("（沒有待辦事項）");
        return;
    }
    for (int i = 0; i < list.Count; i++)   // 用 for 才能顯示編號
    {
        Console.WriteLine($"{i + 1}. {list[i]}");
    }
}
```

逐項說明這支程式怎麼整合 Part 1：

- **`List<string> todos`**（[csharp-1-5]）：存所有待辦。
- **`while` 主迴圈**（[csharp-1-3]）：一直顯示選單直到 `running = false`。
- **`switch`**（[csharp-1-3]）：依使用者選擇分支處理。
- **`ShowTodos` 方法**（[csharp-1-4]）：把「列出」邏輯包成方法、重複使用。
- **`int.TryParse(...)`**：安全地把字串轉成數字——回傳「成功與否」，數字透過 `out int index` 拿到。這是處理「使用者可能亂打」的穩健做法（呼應 rust 的 `Result`、之後 [csharp-3-5] 例外處理）。
- **`string.IsNullOrWhiteSpace`**：檢查輸入不是空白——防呆。

跑起來（`dotnet run`），你就有一個能互動的待辦清單工具了！

## 小練習

1. 把這個 CLI 完整打出來、跑起來，試各種操作（新增、列出、完成、輸入無效編號）。
2. 加一個功能「5) 清空全部」——把 `todos` 整個清空（提示：`todos.Clear()`）。
3. 改進「完成」功能：完成後不要刪除，而是改成「在內容前加上 ✓」標記（提示：需要記錄「完成狀態」，可考慮用別的方式存待辦，這會引導你想到 [csharp-2] 的 class）。

## 課外讀物

> 這支程式用到的 List → [csharp-1-5]、**dsa 課程 Part 2**；穩健處理使用者輸入 → [csharp-3-5] 例外處理

> 練習 3 提示的「待辦需要記更多欄位」，正是下一個 Part 用 class 的動機 → [csharp-2-1]

> 本 Part 完成！下一步：物件導向程式設計 → [csharp-2-1]
