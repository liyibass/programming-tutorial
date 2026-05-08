---
description: 顯示課程進度概覽，哪些章節已完成、哪些還是空的
user-invocable: true
---

掃描課程目錄，顯示目前的撰寫進度。

## 課程結構（即時）

### 主線章節
!`find lessons -name "*.md" | sort 2>/dev/null || echo "（尚無章節）"`

### 課外讀物
!`find 課外讀物 -name "*.md" | sort 2>/dev/null || echo "（尚無課外讀物）"`

### POC 版本
!`find poc -name "*.md" | sort 2>/dev/null || echo "（尚無 POC）"`

### 空目錄（尚未開始）
!`find lessons 課外讀物 poc -type d -empty | sort 2>/dev/null`

## 執行

根據以上資訊，輸出一份進度報告：

1. 統計各 Part 已完成的章節數 vs 課程大綱預計章節數
2. 列出「已有內容」的章節（綠色 ✅）
3. 列出「目錄存在但還是空的」章節（紅色 ❌）
4. 建議下一個應該撰寫的章節
