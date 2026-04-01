import requests
import base64

# 設定
TOKEN = "ghp_你的Token在這裡"
REPO = "wugys/europe-travel-guide"
FILE_PATH = "index.html"  # 要上傳的檔案路徑

# 讀取檔案並編碼
with open(FILE_PATH, "rb") as f:
    content = f.read()
    content_b64 = base64.b64encode(content).decode()

# 呼叫 GitHub API
url = f"https://api.github.com/repos/{REPO}/contents/{FILE_PATH}"
headers = {
    "Authorization": f"token {TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}
data = {
    "message": "Add index.html",
    "content": content_b64
}

response = requests.put(url, headers=headers, json=data)

if response.status_code == 201:
    print("✅ 上傳成功！")
else:
    print(f"❌ 失敗: {response.status_code}")
    print(response.json())
