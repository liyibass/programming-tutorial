# [infra-6-1] Shell scripting：把重複的維運動作寫成腳本

> **本章目標**：學會把「一串常做的指令」寫成可重跑的 shell 腳本，用變數、條件、迴圈讓它更聰明，從此告別「每次都手動打一遍」。

## 你會學到

- shell 腳本是什麼、為什麼維運離不開它
- 腳本的基本骨架：shebang、變數、`if`、`for`
- 「離開代碼（exit code）」與 `set -e`（遇錯即停）
- 寫一個實用的伺服器健康檢查腳本

## 概念說明

### 痛點：同一串指令，你打過幾百遍了

到目前為止，你已經做過很多「一連串的指令」：更新套件、檢查磁碟、看服務狀態……。這些動作你會一而再、再而三地做。每次都手動打一遍，又慢又容易漏、又容易打錯。

**Shell 腳本（Shell Script）** 就是解法：把這一串指令**寫進一個檔案**，之後要做時，執行這個檔案就好——電腦會一行一行照著跑。

用類比：如果單一指令是「一個動作」，腳本就是把一套動作**錄起來變成一個「快捷組合技」**。按一個鍵，整套連招自動打完。這是 Part 1-1 說的「現代 infra 靠程式碼，不靠雙手」最基礎的一步。

---

### 最小的腳本：三個要素

一個 shell 腳本檔，最基本長這樣：

```bash
#!/bin/bash
echo "Hello, infra!"
```

兩行就是一個能跑的腳本，但有三個觀念要懂：

1. **第一行 `#!/bin/bash`**：叫做 **shebang**，告訴系統「這個檔案要用 bash 來執行」。幾乎所有 shell 腳本第一行都是它。
2. **副檔名習慣用 `.sh`**：例如 `backup.sh`，讓人一看就知道是腳本。
3. **要有執行權限**：還記得 Part 2-2 嗎？要 `chmod +x backup.sh` 給它執行權限，才能跑。

---

### 讓腳本聰明一點：變數、條件、迴圈

純粹一串指令還不夠，加上「程式邏輯」才強大。這些你在 basic 課程學過，shell 的寫法稍有不同，但概念一樣：

**變數**——存東西重複用：

```bash
BACKUP_DIR="/home/deploy/backups"
echo "備份會放到 $BACKUP_DIR"
```

注意：設定用 `名稱=值`（**等號兩邊不能有空格**，這是新手最常踩的雷）；使用時要在前面加 `$`。

**條件 `if`**——依情況做不同的事：

```bash
if [ -d "$BACKUP_DIR" ]; then
    echo "備份資料夾存在"
else
    echo "找不到備份資料夾，建立一個"
    mkdir -p "$BACKUP_DIR"
fi
```

`[ -d "$BACKUP_DIR" ]` 是測試「這個資料夾存在嗎」（`-d` = directory）。

**迴圈 `for`**——對一堆東西做同一件事：

```bash
for service in nginx ssh docker; do
    echo "檢查 $service ..."
done
```

這會依序把 `service` 設成 nginx、ssh、docker，各跑一次迴圈內容。

---

### 關鍵安全觀念：exit code 與 set -e

每個指令跑完都會回一個**離開代碼（exit code）**：`0` 代表成功，非 0 代表失敗。腳本可以靠它判斷上一步成不成功。

但有個陷阱：**預設情況下，腳本中間某行失敗了，它還是會「繼續往下跑」**。這很危險——例如「備份」那步失敗了，後面「刪掉舊檔案」卻照跑，資料就沒了。

解法是在腳本開頭加一行：

```bash
set -e
```

`set -e` 的意思是「**任何一行失敗就立刻停止整個腳本**」。這能避免「錯誤累積成災難」，是寫維運腳本的標準保命設定。

```mermaid
graph LR
    A["沒有 set -e<br/>某步失敗→繼續跑→雪上加霜"]
    B["有 set -e<br/>某步失敗→立刻停→止損"]
    A -.->|"建議改用"| B
```

## 程式碼範例

### 一個實用的伺服器健康檢查腳本

把前面的觀念組合起來，寫一個「一鍵檢查伺服器健康」的腳本。建立檔案：

```bash
vi ~/infra-practice/healthcheck.sh
```

寫入：

```bash
#!/bin/bash
set -e

echo "===== 伺服器健康檢查 $(date) ====="

# 1. 磁碟使用率（呼應 Part 2-4）
echo "--- 磁碟空間 ---"
df -h /

# 2. 記憶體（呼應 Part 2-3）
echo "--- 記憶體 ---"
free -h

# 3. 檢查幾個關鍵服務在不在跑
echo "--- 服務狀態 ---"
for service in ssh nginx docker; do
    if systemctl is-active --quiet "$service"; then
        echo "✅ $service 正在運行"
    else
        echo "⚠️  $service 沒有運行"
    fi
done

echo "===== 檢查完成 ====="
```

幾個重點：`$(date)` 是「指令替換」——把 `date` 指令的輸出（現在時間）塞進字串裡。`systemctl is-active --quiet` 安靜地檢查服務在不在跑（呼應 Part 4-1），搭配 `if` 印出友善的結果。

給它執行權限並執行：

```bash
chmod +x ~/infra-practice/healthcheck.sh
~/infra-practice/healthcheck.sh
```

一行指令，整台機器的健康狀態一目了然。以後每次想巡檢，跑這個就好——這就是腳本的價值。

> 在 WSL 上練這個完全沒問題（前提是 Part 0 已啟用 systemd，`systemctl` 才能用）。

## 小練習

### 練習 1：寫你的第一個腳本

建立一個 `hello.sh`，用變數存你的名字，再用 `echo` 印出問候語。記得加 shebang、`chmod +x`，然後執行它。

---

### 練習 2：踩雷與排雷

下面這行為什麼會出錯？

```bash
NAME = "Alice"
```

> 提示：回想「等號兩邊」的規則。

---

### 練習 3：擴充健康檢查腳本

在上面的 `healthcheck.sh` 加一段，檢查「磁碟使用率有沒有超過 80%，超過就印警告」。

> 提示：可以用 `df` 搭配文字處理工具取出百分比數字，再用 `if [ 數字 -gt 80 ]` 判斷（`-gt` = greater than）。這題有挑戰性，查資料、試錯都是學習的一部分。

## 課外讀物

> 腳本裡用到的 `cd`、`ls`、`mkdir` 這些基礎操作，想再熟練一點 → [課外讀物 E-1-2：基本導航指令](../../../課外讀物/E-1-terminal/E-1-2-basic-navigation.md)
