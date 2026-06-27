# [csharp-3-6] 現代 C#：Nullable 參考型別、`record`、pattern matching

> **本章目標**：認識幾個現代 C# 的重要特性，它們讓程式更安全、更簡潔——你會在現代 .NET 專案大量看到。

## 你會學到

- 可空參考型別（nullable reference types）：對抗 null 災難
- `record`：簡潔的不可變資料型別
- pattern matching（模式比對）的進化
- 這些特性怎麼讓現代 C# 更好

## 概念說明

C# 持續演進，加入很多讓程式「更安全、更簡潔」的特性。這章挑三個你會常遇到的重點。

### ① 可空參考型別：對抗 null

`null`（空參考）是 bug 大宗——你以為有值，結果是 null，一存取就 `NullReferenceException`（呼應 rust 課程 [rust-3-4] 的「十億美元錯誤」、cs 課程的概念）。現代 C# 用**可空參考型別（nullable reference types）** 對抗它：

```csharp
string name = "Amy";       // 「不可為 null」——編譯器保證
string? nickname = null;   // 加 ? 才「可以為 null」

Console.WriteLine(name.Length);       // OK，name 保證有值
Console.WriteLine(nickname.Length);   // ⚠️ 編譯器警告！nickname 可能是 null
```

說明：開啟這個功能後（現代專案預設開），**型別預設「不可為 null」**，要可為 null 得明確加 `?`。編譯器會在你「可能存取到 null」時警告——把「忘記檢查 null」的錯誤提早抓出來（呼應 rust 的 `Option`，但 C# 是用 `?` 標註 + 編譯器警告的方式）。處理可空值的安全寫法：

```csharp
string? input = Console.ReadLine();
// 安全存取：?. 如果是 null 就回 null 而不爆炸
int? length = input?.Length;
// 或給預設值：?? 「左邊是 null 就用右邊」
string safe = input ?? "（預設值）";
```

`?.`（null 條件運算子）和 `??`（null 合併運算子）是處理可空值的利器。

### ② record：簡潔的不可變資料型別

很多時候你只是要一個「**單純裝資料的型別**」（像 DTO、值物件）。用一般 class 要寫一堆樣板（屬性、建構子、相等比較…）。**`record`** 讓這變成一行：

```csharp
// 一行定義一個不可變的資料型別！
record Person(string Name, int Age);

var amy = new Person("Amy", 28);
Console.WriteLine(amy.Name);        // Amy
Console.WriteLine(amy);             // Person { Name = Amy, Age = 28 }（自動好看的輸出）

// record 自動有「以值比較相等」
var amy2 = new Person("Amy", 28);
Console.WriteLine(amy == amy2);     // true！（內容相同就相等，不像 class 比參考）

// record 預設不可變，要「改」是產生新的（with）
var olderAmy = amy with { Age = 29 };   // 複製一份、只改 Age
```

說明：`record` 一行就有了——屬性、建構子、好看的 ToString、**以值比較相等**（兩個內容相同的 record 就相等，對比一般 class 是比參考 [csharp-1-2]）、`with` 複製修改。它**預設不可變**（呼應 rust 的不可變傾向、函式式風格）。`record` 超適合做 [csharp-5-4] 的 DTO、領域裡的「值物件」。

### ③ Pattern Matching：強大的模式比對

現代 C# 的**模式比對**讓「依資料的樣子分支」更優雅（呼應 rust 課程 [rust-3-5] match）：

```csharp
// switch 表達式 + 模式（csharp-1-3 看過基礎，這裡更進階）
string Describe(object obj) => obj switch
{
    int n when n > 0 => $"正整數 {n}",       // when 加條件
    int n => $"非正整數 {n}",
    string s => $"字串「{s}」",               // 依「型別」比對
    Person { Age: > 18 } => "成年人",         // 依「屬性」比對！
    null => "空值",
    _ => "其他"
};

Console.WriteLine(Describe(5));                    // 正整數 5
Console.WriteLine(Describe("hi"));                // 字串「hi」
Console.WriteLine(Describe(new Person("Bob", 20))); // 成年人
```

說明：模式比對能依「型別」（`int n`）、「條件」（`when n > 0`）、「屬性」（`Person { Age: > 18 }`）來分支——非常強大且好讀。它讓很多原本要寫一堆 `if-else + 轉型` 的程式碼變簡潔。

### 這些特性讓現代 C# 更好

```
可空參考型別 → 更安全（編譯期抓 null 問題）
record → 更簡潔（資料型別一行搞定）+ 鼓勵不可變（更好推理、少 bug）
pattern matching → 更優雅（依樣貌分支）
→ 現代 C#（含這些特性）兼具「強型別的安全」和「現代語言的簡潔」。
  你在新專案會大量看到它們，認得就不陌生。
```

## 小練習

1. 用 `record` 定義一個 `Product(string Name, decimal Price)`，建立兩個內容相同的，用 `==` 確認它們相等。用 `with` 產生一個「只改價格」的新 product。
2. 寫一段處理 `string?`（可能 null）的程式，用 `?.` 和 `??` 安全地取得它的長度或預設值。
3. 用 switch 表達式 + 模式比對，寫一個函式依輸入（int / string / null）回傳不同描述。

## 課外讀物

> 對抗 null（Option 概念）、不可變、模式比對 → **rust 課程 [rust-3-4] Option、[rust-1-1] 不可變、[rust-3-5] match**

> record 的不可變呼應函式式 → **cs 課程 Part 8-3**

> 本 Part 完成！語言基礎打好了，下一步進入後端實戰：ASP.NET Core → [csharp-4-1]
