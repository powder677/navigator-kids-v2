#!/usr/bin/env python3
"""
navigatorkidsai.com -- Site Cleanup Script
==========================================
Based on GSC performance data (Dec 2025 - Mar 2026).

KEEP:  New York (all), Texas ARD niche, top content pages
CUT:   California (all), Florida, Pennsylvania, low-traffic content
       Old .html pages (superseded by /slug/ directory versions)

Outputs:
  1. Dry-run report showing what would be deleted vs kept
  2. _redirects file (Netlify/Vercel format) for cut pages
  3. sitemap_clean.xml with only kept URLs
  4. Optional: actually moves cut pages to /_archived/

Usage:
  python cleanup_site.py --root /path/to/site --dry-run
  python cleanup_site.py --root /path/to/site --execute
  python cleanup_site.py --root /path/to/site --execute --redirects-only
"""

import os
import re
import shutil
import argparse
from pathlib import Path
from datetime import datetime
from xml.etree import ElementTree as ET

# ---------------------------------------------
# DECISION RULES
# ---------------------------------------------

# Pages to keep -- matched against URL path (substring or exact)
KEEP_PATTERNS = [
    # --------------------------------------------- Core site structure ---------------------------------------------
    "/",                              # homepage
    "/about/",
    "/contact/",
    "/terms/",
    "/privacy/",
    "/iep/",
    "/iep/what-is-an-iep/",
    "/iep/battle-plan/",
    "/iep/request-evaluation-letter/",

    # --------------------------------------------- New York -- ALL pages kept ---------------------------------------------
    "/iep/states/new-york/",          # catches all NY pages via startswith

    # --------------------------------------------- Texas -- ARD niche only ---------------------------------------------
    "/iep/states/texas/ard-meeting-script/",
    "/iep/states/texas/texas-evaluation-timeline/",
    "/iep/states/texas/tea-complaint/",
    "/iep/states/texas/how-to-request-compensatory-services/",
    "/iep/states/texas/",             # TX state landing -- keep but deprioritise

    # TX districts that have clicks or impressions > 20 in GSC
    "/iep/states/texas/districts/lewisville-isd/",
    "/iep/states/texas/districts/arlington-isd/",
    "/iep/states/texas/districts/north-east-isd/",
    "/iep/states/texas/districts/plano-isd/",
    "/iep/states/texas/districts/fort-bend-isd/",
    "/iep/states/texas/districts/round-rock-isd/",
    "/iep/states/texas/districts/northside-isd/",
    "/iep/states/texas/districts/humble-isd/",
    "/iep/states/texas/districts/austin-isd/",
    "/iep/states/texas/districts/klein-isd/",
    "/iep/states/texas/districts/dallas-isd/",

    # --------------------------------------------- Content pages -- keep top performers by CTR / impressions ---------------------------------------------
    "/resources/meltdown-or-manipulation/",   # 20% CTR -- top performer
    "/resources/restraint-collapse/",
    "/resources/little-professor/",
    "/resources/de-escalation-script/",
    "/resources/smart-kid-lost-shoes/",
    "/little-professor.html",                  # legacy -- will redirect to /resources/
    "/meltdown-or-manipulation.html",
    "/de-escalation-script.html",
    "/resources/",

    # --------------------------------------------- Tools -- keep but rebrand toward app funnel ---------------------------------------------
    "/tools/accommodations/",
    "/tools/ai-guide/",
    "/quiz/",
    "/free/de-escalation-kit/",

    # --------------------------------------------- Utility ---------------------------------------------
    "/sitemap.xml",
    "/robots.txt",
]

# Explicit CUT list -- these are removed regardless of keep patterns
CUT_PATTERNS = [
    "/iep/states/california/",        # all CA -- no conversion path
    "/iep/states/florida/",           # minimal impressions, no fit
    "/iep/states/pennsylvania/",      # near-zero traffic
    "/iep/states/illinois/",          # no traffic, wrong focus
    "/iep/states/new-jersey/",        # no traffic, wrong focus
    "/products/",                     # old product model -- replaced by /pricing/
    "/iep/states/",                   # bare states index -- replaced by focused pages

    # Old .html content pages superseded by /resources/ versions
    # (we keep the .html files ONLY to redirect from them -- handled in redirects)
    # Listed here for reference; actual files moved to archive
    "/beige-diet.html",
    "/emotional-intensity.html",
    "/asynchronous-development.html",
    "/seekers-vs-avoiders.html",
    "/the-sock-war.html",
    "/the-touch-factor.html",
    "/classroom-sensory-solutions.html",
    "/perfectionism-trap.html",
    "/not-everyone-will-get-them.html",
    "/finding-peer-groups.html",
    "/social-connection.html",
    "/cant-vs-wont.html",
    "/laziness-vs-dysfunction.html",
    "/introvert-or-isolated.html",
    "/black-hole-backpack.html",
    "/routine-rescue.html",
    "/calm-down-kit.html",
    "/dopamine-menu.html",
    "/anxiety-intelligence.html",
    "/when-noise-hurts.html",
    "/gifted-assessment-tool.html",
    "/emergency-reset-kit.html",
    "/about.html",                    # superseded by /about/
    "/resources.html",                # superseded by /resources/
    "/terms.html",                    # superseded by /terms/
    "/methodology.html",              # no traffic, no fit
]

# ---------------------------------------------
# REDIRECTS MAP
# Pages being cut #pricingwhere they should 301 to
# ---------------------------------------------

REDIRECTS = {
    # California #pricingnewyorkspecialed.net (keep SEO juice, send to right property)
    "/iep/states/california/":                         "https://newyorkspecialed.net/",
    "/iep/states/california/districts/":               "https://newyorkspecialed.net/",
    "/iep/states/california/california-iep-laws/":     "https://newyorkspecialed.net/iep-law/",
    "/iep/states/california/california-iee/":          "https://newyorkspecialed.net/",
    "/iep/states/california/california-dyslexia-screening/": "https://newyorkspecialed.net/",
    "/iep/states/california/california-district-comparison/": "https://newyorkspecialed.net/",

    # Florida & Pennsylvania #pricingNY homepage (better fit than 404)
    "/iep/states/florida/":                            "/iep/states/new-york/",
    "/iep/states/pennsylvania/":                       "/iep/states/new-york/",

    # Products #pricingpricing section on new homepage (all subpages too)
    "/products/":                                      "/#pricing",
    "/products/activity-packets/":                     "/#pricing",
    "/products/ai-prompts/":                           "/#pricing",

    # New states -- redirect to NY (our focus)
    "/iep/states/illinois/":                           "/iep/states/new-york/",
    "/iep/states/new-jersey/":                         "/iep/states/new-york/",

    # Old .html content #pricing/resources/ canonical versions
    "/beige-diet.html":                                "/resources/",
    "/emotional-intensity.html":                       "/resources/",
    "/asynchronous-development.html":                  "/resources/",
    "/seekers-vs-avoiders.html":                       "/resources/",
    "/the-sock-war.html":                              "/resources/",
    "/the-touch-factor.html":                          "/resources/",
    "/classroom-sensory-solutions.html":               "/resources/",
    "/perfectionism-trap.html":                        "/resources/",
    "/not-everyone-will-get-them.html":                "/resources/",
    "/finding-peer-groups.html":                       "/resources/",
    "/social-connection.html":                         "/resources/",
    "/cant-vs-wont.html":                              "/resources/",
    "/laziness-vs-dysfunction.html":                   "/resources/",
    "/introvert-or-isolated.html":                     "/resources/",
    "/black-hole-backpack.html":                       "/resources/",
    "/routine-rescue.html":                            "/resources/",
    "/calm-down-kit.html":                             "/resources/",
    "/dopamine-menu.html":                             "/resources/",
    "/anxiety-intelligence.html":                      "/resources/",
    "/when-noise-hurts.html":                          "/resources/",
    "/gifted-assessment-tool.html":                    "/resources/",
    "/emergency-reset-kit.html":                       "/resources/",
    "/de-escalation-script.html":                      "/resources/de-escalation-script/",
    "/meltdown-or-manipulation.html":                  "/resources/meltdown-or-manipulation/",
    "/little-professor.html":                          "/resources/little-professor/",

    # About/terms legacy .html #pricingcanonical directory versions
    "/about.html":                                     "/about/",
    "/resources.html":                                 "/resources/",
    "/terms.html":                                     "/terms/",
    "/methodology.html":                               "/about/",

    # States index #pricingNY (our focus)
    "/iep/states/":                                    "/iep/states/new-york/",
}

# ---------------------------------------------
# HELPERS
# ---------------------------------------------

def url_to_path(root: Path, url_path: str) -> Path:
    """Convert a URL path to a filesystem path."""
    # Strip leading slash, handle trailing slash #pricingindex.html
    p = url_path.lstrip("/")
    if not p:
        return root / "index.html"
    if p.endswith("/"):
        return root / p.rstrip("/") / "index.html"
    return root / p


def classify_url(url_path: str) -> str:
    """Return 'keep', 'cut', or 'unknown' for a URL path.

    Priority order:
      1. KEEP wins if a keep-pattern is MORE specific than any matching cut-pattern.
         "More specific" = longer pattern string (e.g. /iep/states/new-york/ beats
         /iep/states/ because it's a longer, more targeted rule).
      2. If only a cut-pattern matches, it's cut.
      3. If only a keep-pattern matches, it's kept.
      4. Otherwise unknown.
    """
    best_keep_len = 0
    best_cut_len  = 0

    # Score keep patterns
    for pattern in KEEP_PATTERNS:
        if pattern.endswith("/"):
            if url_path.startswith(pattern) or url_path == pattern.rstrip("/"):
                best_keep_len = max(best_keep_len, len(pattern))
        else:
            if url_path == pattern:
                best_keep_len = max(best_keep_len, len(pattern))

    # Score cut patterns
    for pattern in CUT_PATTERNS:
        if pattern.endswith("/"):
            if url_path.startswith(pattern) or url_path == pattern.rstrip("/"):
                best_cut_len = max(best_cut_len, len(pattern))
        else:
            if url_path == pattern:
                best_cut_len = max(best_cut_len, len(pattern))

    if best_keep_len == 0 and best_cut_len == 0:
        return "unknown"
    if best_keep_len >= best_cut_len:
        return "keep"
    return "cut"


def walk_site(root: Path):
    """Walk site directory, yield (url_path, file_path) for all HTML files.

    Uses explicit parts joining (no str(rel)) so Windows backslashes never
    contaminate URL paths.  Skips build artefact and asset directories.
    """
    SKIP_DIRS = {
        "node_modules", "_archived", "_archive", ".git", ".github",
        "vendor", "assets", "css", "js", "images", "img", "fonts",
        "dist", ".next", "_site", "__pycache__",
    }
    # Partial/include files that are not standalone pages
    SKIP_FILES = {
        "header.html", "footer.html", "nav.html", "head.html",
        "sidebar.html", "partials.html", "_header.html", "_footer.html",
    }

    found = []
    for fp in sorted(root.rglob("*.html")):
        if any(part in SKIP_DIRS for part in fp.parts):
            continue
        if fp.name in SKIP_FILES:
            continue
        found.append(fp)

    if not found:
        # Diagnostic: show what IS in the root so the user knows what happened
        print("  [!]  No HTML files found under the root directory.")
        print("  [!]  Showing first 20 items to help diagnose:\n")
        items = sorted(root.iterdir())[:20]
        for item in items:
            tag = "[dir] " if item.is_dir() else "[file]"
            print(f"       {tag} {item.name}")
        print()
        print("  Hint: pass the folder that contains index.html, e.g.")
        print("        --root .\\iep  or  --root .\\public")
        print()
        return

    for fp in found:
        rel = fp.relative_to(root)
        parts = rel.parts          # tuple of str -- OS-agnostic, no backslashes

        if parts[-1] == "index.html":
            if len(parts) == 1:
                url = "/"
            else:
                url = "/" + "/".join(parts[:-1]) + "/"
        else:
            url = "/" + "/".join(parts)

        yield url, fp


def parse_sitemap(sitemap_path: Path, debug: bool = False):
    """Extract URLs from sitemap.xml.

    Three-strategy parser so it works regardless of namespace variation,
    BOM characters, or malformed XML:
      1. ElementTree with detected namespace
      2. ElementTree with no namespace (bare <url><loc> tags)
      3. Regex fallback on raw text
    """
    if not sitemap_path.exists():
        print(f"  [!]  Sitemap not found at: {sitemap_path.resolve()}")
        return []

    raw = sitemap_path.read_bytes()
    # Strip UTF-8 BOM if present
    if raw.startswith(b"\xef\xbb\xbf"):
        raw = raw[3:]
    text = raw.decode("utf-8", errors="replace")

    if debug:
        print(f"  [debug] sitemap path  : {sitemap_path.resolve()}")
        print(f"  [debug] sitemap size  : {len(text)} chars")
        print(f"  [debug] first 300 chars:")
        print("  " + text[:300].replace("\n", "\n  "))
        print()

    urls = []

    # Strategy 1: ElementTree -- detect namespace from root tag
    try:
        root_el = ET.fromstring(text)
        tag = root_el.tag  # e.g. "{http://www.sitemaps.org/schemas/sitemap/0.9}urlset"
        ns_match = re.match(r"\{(.+?)\}", tag)
        ns_uri = ns_match.group(1) if ns_match else ""

        if ns_uri:
            ns = {"sm": ns_uri}
            find_url = lambda el: el.findall("sm:url", ns)
            find_loc = lambda el: el.find("sm:loc", ns)
        else:
            find_url = lambda el: el.findall("url")
            find_loc = lambda el: el.find("loc")

        for url_el in find_url(root_el):
            loc = find_loc(url_el)
            if loc is not None and loc.text:
                path = re.sub(r"^https?://[^/]+", "", loc.text.strip())
                if path:
                    urls.append(path)

        if debug:
            print(f"  [debug] strategy 1 (ElementTree, ns={ns_uri!r}): {len(urls)} URLs")

        if urls:
            return urls
    except ET.ParseError as e:
        if debug:
            print(f"  [debug] strategy 1 failed: {e}")

    # Strategy 2: no-namespace ElementTree (bare <url><loc> tags)
    try:
        root_el = ET.fromstring(text)
        for url_el in root_el.findall("url"):
            loc = url_el.find("loc")
            if loc is not None and loc.text:
                path = re.sub(r"^https?://[^/]+", "", loc.text.strip())
                if path:
                    urls.append(path)
        if debug:
            print(f"  [debug] strategy 2 (no namespace): {len(urls)} URLs")
        if urls:
            return urls
    except ET.ParseError:
        pass

    # Strategy 3: regex on raw text -- works even on malformed XML
    found = re.findall(r"<loc>\s*(https?://[^<]+)\s*</loc>", text)
    for full_url in found:
        path = re.sub(r"^https?://[^/]+", "", full_url.strip())
        if path:
            urls.append(path)
    if debug:
        print(f"  [debug] strategy 3 (regex): {len(urls)} URLs")

    if not urls:
        print(f"  [!]  Sitemap parsed but contained no <loc> entries.")
        print(f"     Try running with --debug to inspect the file.")

    return urls


# ---------------------------------------------
# MAIN ACTIONS
# ---------------------------------------------

def run_audit(root: Path, sitemap_path: Path, debug: bool = False):
    """Audit the site and return categorised lists."""
    print(f"\n{'='*60}")
    print(f"  Navigator Site Cleanup -- Audit Report")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"  Root: {root}")
    print(f"{'='*60}\n")

    keep = []
    cut = []
    unknown = []

    # Walk filesystem if root exists, otherwise use sitemap
    if root.exists():
        source = list(walk_site(root))
        print(f"Source: filesystem ({len(source)} HTML files found)")
        if not source:
            print("  -> No HTML found on disk -- falling back to sitemap\n")
            sitemap_urls = parse_sitemap(sitemap_path, debug=debug)
            source = [(u, url_to_path(root, u)) for u in sitemap_urls]
            if source:
                print(f"  -> Sitemap fallback: {len(source)} URLs loaded\n")
            else:
                print("  -> Sitemap also empty or not found. Nothing to audit.\n")
                return [], [], []
        else:
            print()
    else:
        sitemap_urls = parse_sitemap(sitemap_path, debug=debug)
        source = [(u, url_to_path(root, u)) for u in sitemap_urls]
        print(f"Source: sitemap ({len(source)} URLs found)\n")

    for url, fp in source:
        decision = classify_url(url)
        if decision == "keep":
            keep.append((url, fp))
        elif decision == "cut":
            cut.append((url, fp))
        else:
            unknown.append((url, fp))

    # --------------------------------------------- Report: KEEP ---------------------------------------------
    print(f"[OK]  KEEP ({len(keep)} pages)")
    print("-" * 50)
    for url, _ in sorted(keep):
        redirect_note = f"  #pricing {REDIRECTS[url]}" if url in REDIRECTS else ""
        print(f"  {url}{redirect_note}")

    # --------------------------------------------- Report: CUT ---------------------------------------------
    print(f"\n[CUT]   CUT ({len(cut)} pages)")
    print("-" * 50)

    # Group by section for readability
    sections = {}
    for url, fp in sorted(cut):
        section = url.split("/")[2] if url.count("/") >= 2 else "root"
        sections.setdefault(section, []).append((url, fp))

    for section, items in sorted(sections.items()):
        print(f"\n  [{section}] -- {len(items)} pages")
        for url, _ in items:
            dest = REDIRECTS.get(url, "-> 410 Gone")
            print(f"    {url:<60}  301 {dest}")

    # --------------------------------------------- Report: UNKNOWN ---------------------------------------------
    if unknown:
        print(f"\n[?]  UNCATEGORISED ({len(unknown)} pages) -- review manually")
        print("-" * 50)
        for url, _ in sorted(unknown):
            print(f"  {url}")

    # --------------------------------------------- Summary ---------------------------------------------
    total = len(keep) + len(cut) + len(unknown)
    print(f"\n{'='*60}")
    print(f"  Summary")
    print(f"{'='*60}")
    print(f"  Total pages:      {total}")
    pct = lambda n: f"{n/total*100:.0f}%" if total else "--"
    print(f"  Keeping:          {len(keep)}  ({pct(len(keep))})")
    print(f"  Cutting:          {len(cut)}  ({pct(len(cut))})")
    print(f"  Needs review:     {len(unknown)}")
    print(f"\n  CA pages cut:     {sum(1 for u,_ in cut if '/california/' in u)}")
    print(f"  FL/PA pages cut:  {sum(1 for u,_ in cut if '/florida/' in u or '/pennsylvania/' in u)}")
    print(f"  .html files cut:  {sum(1 for u,_ in cut if u.endswith('.html'))}")
    print()

    return keep, cut, unknown


def write_redirects(output_path: Path, cut: list, format: str = "netlify"):
    """Write _redirects file for cut pages."""
    lines = []

    if format == "netlify":
        lines.append("# Navigator -- 301 Redirects")
        lines.append(f"# Generated {datetime.now().strftime('%Y-%m-%d')}")
        lines.append("# Format: /old-path  /new-path  301\n")

        def find_wildcard_parent(url: str) -> str | None:
            """Return the redirect destination if a parent wildcard rule covers this URL."""
            parts = url.rstrip("/").split("/")
            for depth in range(len(parts), 0, -1):
                parent = "/".join(parts[:depth]) + "/"
                if parent in REDIRECTS and parent != url:
                    return REDIRECTS[parent]
            return None

        written_wildcards = set()
        for url, _ in sorted(cut):
            dest = REDIRECTS.get(url)
            if dest:
                if url.endswith("/"):
                    wildcard_rule = f"{url}*  {dest}  301"
                    if wildcard_rule not in written_wildcards:
                        lines.append(wildcard_rule)
                        written_wildcards.add(wildcard_rule)
                else:
                    lines.append(f"{url}  {dest}  301")
            else:
                parent_dest = find_wildcard_parent(url)
                if parent_dest:
                    lines.append(f"# covered by wildcard above #pricing{parent_dest}: {url}")
                else:
                    lines.append(f"# REVIEW: {url}  (no redirect defined -- will 404)")

    elif format == "nginx":
        lines.append("# Navigator -- nginx redirects")
        lines.append(f"# Generated {datetime.now().strftime('%Y-%m-%d')}\n")
        for url, _ in sorted(cut):
            dest = REDIRECTS.get(url)
            if dest:
                if url.endswith("/"):
                    lines.append(f"location ^~ {url} {{ return 301 {dest}; }}")
                else:
                    lines.append(f"location = {url} {{ return 301 {dest}; }}")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    real_rules = [l for l in lines if l and not l.startswith("#")]
    covered    = [l for l in lines if l.startswith("# covered by wildcard")]
    review     = [l for l in lines if l.startswith("# REVIEW:")]
    print(f"[OK]  Redirects written: {output_path}")
    print(f"   {len(real_rules)} active rules  |  {len(covered)} covered by wildcard  |  {len(review)} need manual review")


def write_clean_sitemap(output_path: Path, keep: list, base_url: str = "https://www.navigatorkidsai.com"):
    """Write a new sitemap containing only kept pages."""
    today = datetime.now().strftime("%Y-%m-%dT%H:%M:%S+00:00")

    # Priority rules
    def priority(url):
        if url == "/":                              return "1.00"
        if url.startswith("/iep/states/new-york/"): return "0.80"
        if url.startswith("/iep/states/texas/ard"): return "0.75"
        if url.startswith("/iep/states/texas/"):    return "0.65"
        if url.startswith("/resources/"):           return "0.60"
        if url.startswith("/tools/"):               return "0.55"
        return "0.50"

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for url, _ in sorted(keep, key=lambda x: x[0]):
        if url.endswith(".html"):
            continue  # don't include legacy .html pages in new sitemap
        lines.append("  <url>")
        lines.append(f"    <loc>{base_url}{url}</loc>")
        lines.append(f"    <lastmod>{today}</lastmod>")
        lines.append(f"    <priority>{priority(url)}</priority>")
        lines.append("  </url>")
    lines.append("</urlset>")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"[OK]  Clean sitemap written: {output_path}  ({len(keep)} URLs)")


def execute_cleanup(root: Path, cut: list, archive: bool = True):
    """Move cut pages to _archived/ or delete them."""
    archive_root = root / "_archived"
    moved = 0
    skipped = 0

    for url, fp in cut:
        if not fp.exists():
            skipped += 1
            continue

        if archive:
            dest = archive_root / fp.relative_to(root)
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(fp), str(dest))
            moved += 1
        else:
            fp.unlink()
            moved += 1

        # Clean up empty parent directories
        try:
            fp.parent.rmdir()
        except OSError:
            pass

    action = "archived" if archive else "deleted"
    print(f"[OK]  {moved} files {action}  ({skipped} not found on disk)")
    if archive:
        print(f"   Archive location: {archive_root}")


# ---------------------------------------------
# ENTRY POINT
# ---------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Clean up navigatorkidsai.com -- remove low-value pages based on GSC data"
    )
    parser.add_argument(
        "--root", default="./site",
        help="Path to site root directory (default: ./site)"
    )
    parser.add_argument(
        "--sitemap", default=None,
        help="Path to sitemap.xml if root doesn't exist (optional)"
    )
    parser.add_argument(
        "--dry-run", action="store_true", default=False,
        help="Show what would happen without making changes (default)"
    )
    parser.add_argument(
        "--execute", action="store_true", default=False,
        help="Actually move/archive cut pages"
    )
    parser.add_argument(
        "--delete", action="store_true", default=False,
        help="Delete cut pages permanently (use with --execute; default is to archive)"
    )
    parser.add_argument(
        "--redirects-only", action="store_true", default=False,
        help="Only write redirect file, don't touch filesystem"
    )
    parser.add_argument(
        "--format", choices=["netlify", "nginx"], default="netlify",
        help="Redirect file format (default: netlify)"
    )
    parser.add_argument(
        "--output-dir", default="./cleanup-output",
        help="Where to write _redirects and sitemap_clean.xml (default: ./cleanup-output)"
    )
    parser.add_argument(
        "--debug", action="store_true", default=False,
        help="Print resolved paths and sitemap parsing details"
    )

    args = parser.parse_args()

    root = Path(args.root).resolve()
    output_dir = Path(args.output_dir).resolve()
    sitemap_path = Path(args.sitemap).resolve() if args.sitemap else root / "sitemap.xml"

    if args.debug:
        print(f"[debug] root resolved   : {root}")
        print(f"[debug] root exists     : {root.exists()}")
        print(f"[debug] sitemap path    : {sitemap_path}")
        print(f"[debug] sitemap exists  : {sitemap_path.exists()}")
        print(f"[debug] output dir      : {output_dir}")
        print()

    # Always run audit first
    keep, cut, unknown = run_audit(root, sitemap_path, debug=args.debug)

    redirect_filename = "_redirects" if args.format == "netlify" else "nginx_redirects.conf"
    write_redirects(output_dir / redirect_filename, cut, format=args.format)
    write_clean_sitemap(output_dir / "sitemap_clean.xml", keep)

    if args.execute and not args.redirects_only:
        if not root.exists():
            print(f"\n[!]   Cannot execute: root directory '{root}' not found.")
            print("   Run with your actual site root, e.g.:  --root /var/www/navigatorkidsai")
        else:
            print(f"\n{'='*60}")
            print(f"  Executing cleanup ({'DELETE' if args.delete else 'ARCHIVE'} mode)")
            print(f"{'='*60}\n")
            execute_cleanup(root, cut, archive=not args.delete)
    elif not args.execute:
        print("\n[i]  This was a dry run. Add --execute to make changes.")
        print(f"   Redirect file and clean sitemap written to: {output_dir}/\n")


if __name__ == "__main__":
    main()