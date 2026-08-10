#!/usr/bin/env python3
"""TabAPI 真实数据采集 —— ENCORE 照明站
=======================================
对本项目（ENCORE LED 照明 B2B 站）做一轮真实的关键词 + SEO 情报采集：
  1) 关键词挖掘：核心业务词组的 Google SERP（organic 标题 / PAA / related）
  2) 竞品侦察：竞品域名的流量 / top 关键词 / 外链
  3) 自家域名：站点自身的流量与 SEO 现状

输出统一写入 outputs/seo-audit/live/ 目录（JSON + 可读摘要）。
"""
import json
import time
from collections import Counter
from pathlib import Path

from tabapi_client import search, traffic, backlinks, load_key, ROOT

OUT = ROOT / "outputs" / "seo-audit" / "live"
OUT.mkdir(parents=True, exist_ok=True)

# 1) 关键词挖掘 query 池（覆盖产品/场景/采购词）
KEYWORD_QUERIES = [
    "led track lighting",
    "commercial track lighting",
    "magnetic track lighting kit",
    "led downlight",
    "recessed downlight 6 inch",
    "museum lighting fixtures",
    "art gallery lighting",
    "led lighting manufacturer",
    "led lighting factory china",
    "wholesale led lighting",
    "track lighting beam angle",
    "cri 95 track lighting",
]

# 2) 竞品域名
COMPETITORS = [
    "alconlighting.com",
    "grnled.com",
    "tendalighting.com",
    "waclighting.com",
]

# 3) 自家域名（若无法用主域名则用已上线的 vercel 站点）
OWN_DOMAINS = ["encore-tech.com", "astrowindwopress.vercel.app"]


def kw_mining(key):
    print("\n===== [1] 关键词挖掘 (Google SERP) =====")
    all_titles, all_paa, all_related = [], [], []
    raw = {}
    for i, q in enumerate(KEYWORD_QUERIES, 1):
        try:
            d = search(q, key=key)
            raw[q] = d
            org = d.get("organic_results") or []
            titles = [r.get("title", "") for r in org if r.get("title")]
            all_titles.extend(titles)
            paa = [a.get("question") for a in (d.get("people_also_ask") or []) if isinstance(a, dict) and a.get("question")]
            all_paa.extend(paa)
            rel = [r.get("query") for r in (d.get("related_searches") or []) if isinstance(r, dict) and r.get("query")]
            all_related.extend(rel)
            print(f"[{i}/{len(KEYWORD_QUERIES)}] {q}: organic={len(titles)} PAA={len(paa)} related={len(rel)}")
        except Exception as e:
            print(f"[{i}] {q}: ❌ {str(e)[:100]}")
        time.sleep(0.6)

    def freq(ts, n=25):
        stop = {"the", "and", "for", "with", "you", "your", "our", "how", "what",
                "why", "are", "from", "that", "this", "lighting", "led", "light"}
        c = Counter()
        for t in ts:
            for w in t.lower().split():
                w = w.strip("|,.;:()[]—-–“”\"'")
                if len(w) > 2 and w not in stop:
                    c[w] += 1
        return c.most_common(n)

    report = {
        "query_count": len(KEYWORD_QUERIES),
        "total_organic_titles": len(all_titles),
        "title_frequency": dict(freq(all_titles)),
        "people_also_ask": sorted(set(all_paa)),
        "related_searches": sorted(set(all_related)),
    }
    (OUT / "keywords-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
    (OUT / "keywords-raw.json").write_text(
        json.dumps(raw, ensure_ascii=False, indent=1), encoding="utf-8")

    print(f"\n--- 标题高频词 Top 20 ---")
    for w, n in list(report["title_frequency"].items())[:20]:
        print(f"  {w}: {n}")
    print(f"\n--- People Also Ask ({len(report['people_also_ask'])}) ---")
    for q in report["people_also_ask"][:25]:
        print(f"  ? {q}")
    print(f"\n--- Related Searches ({len(report['related_searches'])}) ---")
    for r in report["related_searches"][:25]:
        print(f"  ~ {r}")
    return report


def competitor_recon(key):
    print("\n===== [2] 竞品侦察 =====")
    result = {}
    for d in COMPETITORS:
        entry = {}
        for name, fn in [("traffic", lambda: traffic(d, months=3, key=key)),
                         ("backlinks", lambda: backlinks(d, key=key))]:
            try:
                entry[name] = fn()
            except Exception as e:
                entry[name] = {"error": str(e)[:150]}
            time.sleep(0.6)
        result[d] = entry
        ov = (entry.get("traffic") or {}).get("overview") or {}
        print(f"\n  {d}: rank={ov.get('global_rank')} visits={ov.get('visits')} "
              f"kw={[(k.get('name'), k.get('volume')) for k in (entry.get('traffic', {}).get('top_keywords') or [])[:4]]}")
        bo = (entry.get("backlinks") or {}).get("overview") or {}
        print(f"         DR={bo.get('domain_rating')} backlinks={bo.get('backlinks')} ref_domains={bo.get('referring_domains')}")
    (OUT / "competitor-recon.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=1), encoding="utf-8")
    return result


def own_site(key):
    print("\n===== [3] 自家域名现状 =====")
    result = {}
    for d in OWN_DOMAINS:
        try:
            t = traffic(d, months=3, key=key)
            ov = t.get("overview") or {}
            result[d] = {"traffic": t}
            print(f"  {d}: rank={ov.get('global_rank')} visits={ov.get('visits')} month={ov.get('month')}")
            print(f"    top_keywords={[(k.get('name'), k.get('volume')) for k in (t.get('top_keywords') or [])[:8]]}")
            print(f"    top_regions={[(r.get('country'), round(r.get('share', 0) * 100, 1)) for r in (t.get('top_regions') or [])[:5]]}")
            ts = t.get("traffic_sources") or {}
            print(f"    sources: direct={ts.get('direct')} search={ts.get('search')} social={ts.get('social')} referrals={ts.get('referrals')} gen_ai={ts.get('gen_ai')}")
        except Exception as e:
            result[d] = {"error": str(e)[:150]}
            print(f"  {d}: ❌ {str(e)[:120]}")
        time.sleep(0.6)
    (OUT / "own-site.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=1), encoding="utf-8")
    return result


if __name__ == "__main__":
    key = load_key()
    print(f"TabAPI key: {key[:6]}... (来自 .env，安全)")
    kw = kw_mining(key)
    comp = competitor_recon(key)
    own = own_site(key)
    summary = {
        "fetched_at": __import__("time").strftime("%Y-%m-%d %H:%M:%S"),
        "keywords": {k: v for k, v in kw.items() if k != "people_also_ask" and k != "related_searches"},
        "competitors": {d: {
            "global_rank": (e.get("traffic") or {}).get("overview", {}).get("global_rank"),
            "visits": (e.get("traffic") or {}).get("overview", {}).get("visits"),
            "domain_rating": (e.get("backlinks") or {}).get("overview", {}).get("domain_rating"),
        } for d, e in comp.items()},
        "own_site": {d: {
            "global_rank": (e.get("traffic") or {}).get("overview", {}).get("global_rank"),
            "visits": (e.get("traffic") or {}).get("overview", {}).get("visits"),
        } for d, e in own.items()},
    }
    (OUT / "summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\n✅ 数据已写入: {OUT}/")
