#!/usr/bin/env python3
"""TabAPI 统一接入层 (tabapi.com)
==================================
封装 TabAPI 全部 9 个端点，供本仓库 SEO 脚本复用。
Key 从环境变量 TABAPI_API_KEY 或仓库根目录 .env 读取（.env 已被 gitignore，不入库）。

用法（作为模块导入）:
    from tabapi_client import Traffic, Search, Backlinks, ...

CLI（快速验证）:
    python3 scripts/tabapi_client.py search "led track lighting"
    python3 scripts/tabapi_client.py traffic encore-tech.com
    python3 scripts/tabapi_client.py backlinks alconlighting.com
"""
import json
import os
import sys
import time
import urllib.request
import urllib.parse
from pathlib import Path

BASE_URL = os.environ.get("TABAPI_BASE_URL", "https://tabapi.com/api/v1")
PROXY = os.environ.get("TABAPI_PROXY", "")  # 可选：本地代理 http://127.0.0.1:7897
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"

ROOT = Path(__file__).resolve().parent.parent


def load_key():
    key = os.environ.get("TABAPI_API_KEY", "")
    if key:
        return key
    env = ROOT / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("TABAPI_API_KEY="):
                return line.split("=", 1)[1].strip()
    print("❌ 未找到 TABAPI_API_KEY（请检查 .env 或环境变量）")
    sys.exit(1)


def _opener():
    if PROXY:
        return urllib.request.build_opener(
            urllib.request.ProxyHandler({"http": PROXY, "https": PROXY}))
    return urllib.request.build_opener()


def _request(method, path, key, body=None, timeout=60):
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={
        "Authorization": f"Bearer {key}",
        "User-Agent": UA,
        "Content-Type": "application/json",
    })
    with _opener().open(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


# ---------- GET 端点 ----------
def traffic(domain, months=3, key=None):
    key = key or load_key()
    return _request("GET", f"/domains/{urllib.parse.quote(domain)}/traffic?months={months}", key)


def whois(domain, key=None):
    key = key or load_key()
    return _request("GET", f"/domains/{urllib.parse.quote(domain)}/whois", key)


def rdap(domain, key=None):
    key = key or load_key()
    return _request("GET", f"/domains/{urllib.parse.quote(domain)}/rdap", key)


def dns(domain, key=None):
    key = key or load_key()
    return _request("GET", f"/domains/{urllib.parse.quote(domain)}/dns", key)


def backlinks(domain, key=None):
    key = key or load_key()
    return _request("GET", f"/domains/{urllib.parse.quote(domain)}/backlinks", key)


def search(q, country="us", language="en", page=1, key=None):
    key = key or load_key()
    params = urllib.parse.urlencode(
        {"q": q, "country": country, "language": language, "page": page})
    return _request("GET", f"/search/google?{params}", key)


def reverse_adsense(pub_id, key=None):
    key = key or load_key()
    return _request("GET", f"/publishers/{urllib.parse.quote(pub_id)}/sites", key)


# ---------- POST 端点 ----------
def markdown(url, key=None):
    key = key or load_key()
    return _request("POST", "/markdown", key, body={"url": url})


def screenshot(url, key=None):
    key = key or load_key()
    return _request("POST", "/screenshot", key, body={"url": url})


# ---------- CLI ----------
def _cli(argv):
    if len(argv) < 2:
        print(__doc__)
        return
    cmd = argv[1]
    key = load_key()
    try:
        if cmd == "search":
            data = search(argv[2], page=int(argv[3]) if len(argv) > 3 else 1, key=key)
        elif cmd == "traffic":
            data = traffic(argv[2], months=int(argv[3]) if len(argv) > 3 else 3, key=key)
        elif cmd == "backlinks":
            data = backlinks(argv[2], key=key)
        elif cmd == "dns":
            data = dns(argv[2], key=key)
        elif cmd == "whois":
            data = whois(argv[2], key=key)
        elif cmd == "rdap":
            data = rdap(argv[2], key=key)
        elif cmd == "markdown":
            data = markdown(argv[2], key=key)
        else:
            print(f"未知命令: {cmd}")
            return
        print(json.dumps(data, ensure_ascii=False, indent=2))
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode('utf-8', 'ignore')[:500]}")
    except Exception as e:
        print(f"❌ {e}")


if __name__ == "__main__":
    _cli(sys.argv)
