---
description: 建立新的課程章節檔案，自動套用標準模板
user-invocable: true
---

建立一個新的課程章節。

使用方式：`/new-lesson [章節編號] [標題]`
例如：`/new-lesson 2-3 複合型別：object array tuple`

## 目前課程結構

!`find lessons 課外讀物 -name "*.md" | sort 2>/dev/null || echo "（尚無章節）"`

## 撰寫規範（最新版）

!`cat CLAUDE.md`

## 執行步驟

1. 從使用者的參數解析出「編號」與「標題」
2. 依編號判斷放在哪個目錄：
   - `1-x` → `lessons/part-1/`
   - `E-x-x` → `課外讀物/E-x-xxx/`
   - 以此類推
3. 檔名格式：`{編號}-{title-slug}.md`
4. 用以下模板建立檔案，標題與編號填入，其餘區塊留空等待填寫：

```markdown
# [{編號}] {標題}

> **本章目標**：

## 你會學到

-
-
-

## 概念說明

## 程式碼範例

## 小練習

1.

## 課外讀物

> 想深入了解 XXX → [課外讀物 E-X-X：完整標題](../../課外讀物/E-X-xxx/E-X-X-filename.md)

```

5. 建立完成後輸出檔案路徑，並提示下一步應填寫哪個區塊
