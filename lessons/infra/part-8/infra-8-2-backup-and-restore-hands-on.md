# [infra-8-2] 🔧 動手做：自動備份 + 演練還原

> **本章目標**：寫一個自動備份腳本、用 cron 定時執行，然後**實際演練一次還原**——確認你的備份真的救得回來。

## 你會學到

- 把 8-1 的備份動作寫成可重跑的腳本（複用 Part 6-1）
- 用 cron 排程自動備份（複用 Part 6-2）
- 加上「只保留最近 N 份」的清理邏輯
- **實際演練還原**——這章的重點

## 概念說明

### 這一章把前面的技能全用上

備份不是新技能，而是你學過的東西的組合：

```mermaid
graph LR
    A["8-1 備份動作<br/>（tar / pg_dump）"]
    B["Part 6-1 腳本<br/>（包成可重跑）"]
    C["Part 6-2 cron<br/>（定時自動執行）"]
    D["8-2 還原演練<br/>（驗證真的能救）"]

    A --> B --> C --> D
```

寫腳本（Part 6-1）+ 排程（Part 6-2）+ 備份動作（8-1）= 自動備份。最後加上**還原演練**——這才是讓備份「算數」的關鍵步驟。

> 這章在 WSL 練即可（檔案備份的概念完全一樣）。要備份正式資料、上傳 S3 的部分，再對你的 EC2 操作。

## 程式碼範例

### 第一步：寫備份腳本

建立 `backup.sh`：

```bash
nano ~/infra-practice/backup.sh
```

```bash
#!/bin/bash
set -e                              # 任何一步失敗就停（Part 6-1）

# 設定
SOURCE_DIR="/home/deploy/myapp/uploads"     # 要備份的資料
BACKUP_DIR="/home/deploy/backups"           # 備份放哪
TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)          # 時間戳記，當檔名
BACKUP_FILE="$BACKUP_DIR/backup-$TIMESTAMP.tar.gz"
KEEP_DAYS=7                                  # 只保留 7 天內的備份

# 確保備份資料夾存在
mkdir -p "$BACKUP_DIR"

# 1. 打包壓縮（8-1 學的）
echo "開始備份 $SOURCE_DIR ..."
tar -czf "$BACKUP_FILE" "$SOURCE_DIR"
echo "備份完成：$BACKUP_FILE"

# 2. 清理超過保留天數的舊備份
echo "清理 $KEEP_DAYS 天前的舊備份 ..."
find "$BACKUP_DIR" -name "backup-*.tar.gz" -mtime +$KEEP_DAYS -delete

echo "✅ 全部完成"
```

幾個重點：

- `TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)`——用時間當檔名，每次備份不覆蓋舊的（呼應 Part 6-1 的指令替換）。
- `find ... -mtime +$KEEP_DAYS -delete`——找出「修改時間超過 7 天」的舊備份並刪掉（`-mtime +7`）。這很重要：**沒有清理機制，備份會無限堆積、塞爆硬碟**（Part 2-4 的老問題）。
- `set -e`——備份失敗就立刻停，不會「假裝成功」。

給執行權限並測跑一次：

```bash
chmod +x ~/infra-practice/backup.sh
~/infra-practice/backup.sh
ls -lh ~/infra-practice/../backups   # 確認備份檔產生了
```

---

### 第二步：用 cron 排程自動備份

（複用 Part 6-2）每天凌晨 2 點自動備份：

```bash
crontab -e
```

加入（記得用完整路徑，Part 6-2 的教訓）：

```
0 2 * * * /home/deploy/infra-practice/backup.sh >> /home/deploy/logs/backup.log 2>&1
```

把輸出存進日誌，之後能查「昨晚備份成功了嗎」。

---

### 第三步：上傳異地（3-2-1 的「1」）

在腳本最後加一段，把備份上傳到 S3（需先設好 AWS CLI）：

```bash
# 3. 上傳到 S3（異地副本）
echo "上傳到 S3 ..."
aws s3 cp "$BACKUP_FILE" s3://my-backup-bucket/
```

這樣就湊齊 3-2-1：本機一份、本機 backups 一份、S3 異地一份。

---

### 第四步：演練還原（本章的靈魂）

**這一步最重要，但最多人跳過。** 我們來證明備份真的能救。

模擬「資料毀了」的情境——先看現在有什麼，然後假裝它不見了：

```bash
# 假設這是你的正式資料
ls /home/deploy/myapp/uploads

# 模擬災難：把它移到別處（假裝資料沒了）
mv /home/deploy/myapp/uploads /home/deploy/myapp/uploads_GONE
```

現在資料「不見了」。用備份還原它：

```bash
# 找出最新的備份
ls -t ~/infra-practice/../backups/backup-*.tar.gz | head -1

# 解壓還原（-x 是 extract 解開）
tar -xzf /home/deploy/backups/backup-最新時間.tar.gz -C /
```

`tar -xzf` 的 `x` 是 extract（解開），`-C /` 是還原到根目錄（因為打包時用的是完整路徑）。

**驗證還原成功**：

```bash
ls /home/deploy/myapp/uploads     # 資料回來了嗎？
```

如果檔案都回來了——恭喜，你證明了你的備份是**真的能救的**。確認無誤後，把模擬用的 `uploads_GONE` 刪掉即可。

> 這個「製造災難 → 還原 → 驗證」的演練，正是 8-1 說的「能還原才算數」。請定期做一次（例如每季），確保備份流程一直有效。

## 小練習

### 練習 1：完成自動備份

把 `backup.sh` 寫好、測跑成功、設好 cron 排程。確認備份檔有產生、且檔名帶時間戳。

---

### 練習 2：演練一次完整還原

照第四步，做一次「模擬資料遺失 → 從備份還原 → 驗證資料回來」的完整演練。寫下你的心得：過程順利嗎？有沒有卡關的地方？

> 卡關是好事——代表你在「真正災難」之前就先發現了問題，這正是演練的價值。

### 練習 3：理解保留策略

回答：

1. 腳本裡 `find ... -mtime +7 -delete` 在做什麼？如果拿掉這行，長期下來會怎樣？
2. 你覺得對你的資料，保留幾天（或幾份）合適？為什麼？

> 提示：保留越久越安全，但越佔空間。要在「安全」和「成本」之間取捨——這是 infra 處處都要做的權衡。

## 課外讀物

> 備份是對抗各種安全威脅（含勒索軟體）的最後防線，想了解整體威脅樣貌 → [課外讀物 E-10-1：Web 安全總覽 — OWASP Top 10](../../../課外讀物/E-10-security/E-10-1-web-security-overview.md)
