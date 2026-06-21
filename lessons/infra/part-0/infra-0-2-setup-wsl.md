# [infra-0-2] 🔧 動手做：安裝並設定 WSL

> **本章目標**：在你的 Windows 上裝好 WSL + Ubuntu，做好這門課需要的設定（啟用 systemd、裝 Docker），並確認與 Windows 的檔案互通，讓它成為你之後所有 Linux 練習的家。

## 你會學到

- 用一行指令安裝 WSL 與 Ubuntu
- 啟用 systemd（讓 Part 4 的 `systemctl` 能用）
- 在 WSL 裡安裝 Docker（給 Part 5 用）
- WSL 與 Windows 之間怎麼互相存取檔案

## 概念說明

### 這一章在做什麼

上一章建立了觀念，這一章把環境**實際建起來**。完成後，你會有一個隨開隨用的 Ubuntu，並預先設定好這門課後面會用到的兩個關鍵能力：

```mermaid
graph LR
    A["① 安裝 WSL + Ubuntu"]
    B["② 啟用 systemd<br/>（給 Part 4）"]
    C["③ 安裝 Docker<br/>（給 Part 5）"]
    D["④ 確認檔案互通<br/>＋認識你的環境"]

    A --> B --> C --> D
```

照著做完這四步，你之後翻到任何一章，都能直接動手，不會卡在環境問題。

> 跟著做時，請分清楚指令是在**哪裡**打：標「PowerShell」的在 Windows 的 PowerShell，標「WSL」的在 Ubuntu 終端機裡。

## 程式碼範例

### 第一步：安裝 WSL 與 Ubuntu（在 PowerShell）

用**系統管理員身分**開啟 PowerShell（在開始選單對 PowerShell 按右鍵 →「以系統管理員身分執行」），輸入：

```powershell
wsl --install
```

這一行會自動做完所有事：開啟 WSL 功能、安裝 WSL2、並裝上預設的 **Ubuntu**。裝完它會請你**重新開機**。

重開機後，Ubuntu 會自動啟動，第一次會請你**設定一個使用者名稱和密碼**（這就是你在 Ubuntu 裡的帳號，呼應 Part 2-2 會學的使用者概念）。設好後，你就已經身在 Linux 裡了。

> 如果 `wsl --install` 沒自動裝 Ubuntu，可以手動指定：`wsl --install -d Ubuntu`（`-d` 是 distribution 發行版）。

之後要進入 WSL，隨時在開始選單打開「Ubuntu」，或在 PowerShell 打 `wsl` 即可。

---

### 第二步：認識你的新環境（在 WSL）

進到 Ubuntu 後，用 Part 1-4 將會教的「問機器三個問題」先認識它（現在先照打，感受一下）：

```bash
whoami          # 我是誰（你剛設定的帳號）
uname -a        # 什麼系統、什麼核心
systemd-detect-virt   # 我在什麼環境裡
```

`systemd-detect-virt` 應該會回 `wsl`——這證明你正在一個 WSL 環境裡，完全正常。

先把系統的套件清單更新一下（Part 2-5 會詳解，這裡先做一次當暖身）：

```bash
sudo apt update && sudo apt upgrade -y
```

`-y` 是「所有確認都自動回答 yes」，省得一直按。

---

### 第三步：啟用 systemd（這門課很重要）

這是 WSL 一個關鍵設定。**WSL 預設沒有開啟 systemd**（還記得它是 Part 4 會學的「服務總管」嗎），所以 `systemctl` 一開始可能不能用。我們現在就把它打開。

在 WSL 裡編輯 `/etc/wsl.conf`（又是 `/etc` 設定大本營，Part 2-1 會學到）：

```bash
sudo vi /etc/wsl.conf
```

加入這兩行：

```ini
[boot]
systemd=true
```

存檔離開（vi 的操作：按 `i` 進入編輯模式、改完按 `Esc` 退出編輯、再輸入 `:wq` 存檔離開）。然後**回到 Windows 的 PowerShell**，把 WSL 完整關閉再重開，讓設定生效：

```powershell
wsl --shutdown
```

`--shutdown` 會關掉所有 WSL，下次再打開 Ubuntu 就會帶著新設定啟動。重新進入 Ubuntu 後，驗證 systemd 活了：

```bash
systemctl is-system-running
```

回 `running`（或 `degraded` 也算正常啟動）就代表 systemd 已啟用，之後 Part 4 的 `systemctl`、`journalctl` 都能正常用了。

---

### 第四步：安裝 Docker（給 Part 5 用）

在 WSL 的 Ubuntu 裡，可以直接用官方腳本裝 Docker Engine（跟 Part 5-1 的方式一致）：

```bash
curl -fsSL https://get.docker.com | sudo sh
```

把你的使用者加進 `docker` 群組，這樣不用每次 `sudo`（呼應 Part 2-2 的群組）：

```bash
sudo usermod -aG docker $USER
```

`$USER` 會自動帶入你目前的帳號。改完群組要**重新進入 WSL** 才生效（可以在 PowerShell 跑 `wsl --shutdown` 再重開）。因為你已啟用 systemd，Docker 服務能被正常管理。驗證：

```bash
docker run hello-world
```

看到 "Hello from Docker!" 就成功了。

> 另一條路：你也可以裝 **Docker Desktop for Windows** 並開啟「WSL integration」，它會把 Docker 整合進 WSL。兩種方式擇一即可；本課用上面「直接在 WSL 裝 Docker Engine」的方式，跟 Part 5 完全一致。

---

### 第五步：WSL 與 Windows 檔案互通

這是 WSL 超方便的地方——兩邊的檔案可以互相存取。

**從 WSL 看 Windows 的檔案**：你的 Windows 磁碟掛載在 WSL 的 `/mnt/` 底下（呼應 Part 2-4 的「掛載」概念）。例如 Windows 的 `C:` 槽就是：

```bash
cd /mnt/c/Users/你的Windows使用者名稱
ls
```

你會看到熟悉的 Windows 桌面、下載資料夾等。

**從 Windows 看 WSL 的檔案**：在 Windows 檔案總管的網址列輸入：

```
\\wsl$
```

就能看到你的 Linux 檔案系統，能像一般資料夾一樣瀏覽。

> **小建議**：寫程式、放專案檔，請放在 **WSL 自己的家目錄**（`/home/你的帳號/`）裡，而不是 `/mnt/c/...`。因為跨系統存取（`/mnt/c`）的檔案讀寫會慢很多。把專案放 WSL 這邊，Docker build、git 操作都會快很多。

## 小練習

### 練習 1：完成整套安裝

從第一步做到第五步，把 WSL + Ubuntu + systemd + Docker 都裝設好。每完成一步，用對應的驗證指令確認成功：

| 步驟 | 驗證指令 | 預期結果 |
|------|---------|---------|
| 裝好 Ubuntu | `whoami` | 你的帳號名 |
| 啟用 systemd | `systemctl is-system-running` | `running` 或 `degraded` |
| 裝好 Docker | `docker run hello-world` | "Hello from Docker!" |

---

### 練習 2：玩一下檔案互通

1. 在 WSL 跑 `cd /mnt/c` 然後 `ls`，找到你的 Windows 檔案。
2. 在 Windows 檔案總管網址列輸入 `\\wsl$`，找到你的 Linux 檔案。
3. 想想看：為什麼專案檔建議放在 WSL 家目錄、而不是 `/mnt/c`？

---

### 練習 3：建立你的「家」

在 WSL 的家目錄建立一個之後練習用的資料夾：

```bash
cd ~
mkdir infra-practice
cd infra-practice
pwd
```

`~` 是「家目錄」的捷徑。`pwd`（Part 1-4 會學）會印出完整路徑，應該像 `/home/你的帳號/infra-practice`。這裡就是你之後做這門課練習的基地了。

> 環境準備好了！接下來 Part 1 開始，你就能一邊讀、一邊在這個 WSL 環境裡動手。記得：少數「對外伺服器」的章節（防火牆對外、公開 HTTPS）再開 AWS EC2 來練即可。

## 課外讀物

> WSL 裡你會大量用到終端機的導航與檔案操作，先熟悉這些基本功 → [課外讀物 E-1-2：基本導航指令](../../../課外讀物/E-1-terminal/E-1-2-basic-navigation.md)
