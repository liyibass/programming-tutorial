---
description: 建立新版本 POC 的 README 與目錄結構
user-invocable: true
---

建立一個新的 POC 版本腳架。

使用方式：`/new-poc [版本號]`
例如：`/new-poc v2`

## POC 版本對照（最新）

!`cat 課程大綱.md | grep -A 20 "POC 版本對照表"`

## 目前 POC 狀態

!`find poc -type f | sort 2>/dev/null || echo "（尚無 POC 檔案）"`

## 執行步驟

1. 確認版本號格式正確（v1~v7）
2. 在 `poc/vN/` 目錄下建立 `README.md`，內容使用以下模板：

```markdown
# POC V{N} — {版本標題}

> **解鎖條件**：完成 {對應 Part} 後

## 這個版本做了什麼

（說明這版新增的功能與技術）

## 相較於 V{N-1} 的改變

- 新增：
- 修改：
- 移除：

## 如何跑起來

\`\`\`bash
# 安裝依賴
npm install

# 啟動開發環境
npm run dev
\`\`\`

## 專案結構

\`\`\`
poc/v{N}/
├── （列出主要檔案結構）
\`\`\`

## 學到了什麼

（列出這個版本涉及的核心技術概念）
```

3. 建立完成後輸出路徑，並提示應該填入哪些程式碼檔案
