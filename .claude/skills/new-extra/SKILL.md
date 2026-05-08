---
description: 建立新的課外讀物章節，使用輕鬆的格式（無小練習）
user-invocable: true
---

建立一個新的課外讀物章節。

使用方式：`/new-extra [編號] [標題]`
例如：`/new-extra E-8-3 Rebase vs Merge：歷史要整齊還是要真實？`

## 目前課外讀物狀態

!`find 課外讀物 -name "*.md" | sort 2>/dev/null || echo "（尚無課外讀物）"`

## 撰寫規範（最新版）

!`cat CLAUDE.md`

## 執行步驟

1. 從編號判斷放在哪個目錄：
   - `E-1-x` → `課外讀物/E-1-terminal/`
   - `E-2-x` → `課外讀物/E-2-npm/`
   - `E-3-x` → `課外讀物/E-3-network/`
   - `E-4-x` → `課外讀物/E-4-database/`
   - `E-5-x` → `課外讀物/E-5-fun-facts/`
   - `E-6-x` → `課外讀物/E-6-best-practices/`
   - `E-7-x` → `課外讀物/E-7-solid/`
   - `E-8-x` → `課外讀物/E-8-git/`
   - `E-9-x` → `課外讀物/E-9-testing/`
   - `E-10-x` → `課外讀物/E-10-security/`
   - `E-11-x` → `課外讀物/E-11-performance/`
   - `E-12-x` → `課外讀物/E-12-design-patterns/`
   - `E-13-x` → `課外讀物/E-13-scaling/`

2. 檔名格式：`{編號}-{title-slug}.md`

3. 用以下模板建立（注意：課外讀物**不需要「小練習」**，語氣比主線更輕鬆）：

```markdown
# [{編號}] {標題}

> **這篇在說什麼**：（一句話說明）

## 概念說明

（先用類比或故事帶入，比主線課程更輕鬆）

## 深入一點

（正式概念說明，可附圖表）

## 延伸閱讀

- （可選：推薦外部資源）
- （可選：連結到相關課外讀物，格式：`[課外讀物 E-X-X：標題](../E-X-xxx/E-X-X-filename.md)`）
```

4. 建立完成後輸出路徑，提示填寫「這篇在說什麼」和「概念說明」
