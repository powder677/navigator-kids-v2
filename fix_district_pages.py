#!/usr/bin/env python3
"""
fix_district_pages.py
=====================
Fixes all NYC district pages under iep/states/new-york/districts/

Problems fixed:
  1. Broken double-nested <iframe> map blocks -> removed entirely
  2. Old nav (products, cart, quiz, iep/states) -> new site nav matching homepage
  3. Old fonts (Merriweather/Inter) -> Fraunces/Outfit matching homepage
  4. Dead links (/products/, /cart/, /iep/states/) -> correct destinations
  5. Missing Navigator CTA block at bottom of each page

Usage:
  python fix_district_pages.py --root . --dry-run
  python fix_district_pages.py --root . --execute
"""

import re
import sys
import shutil
import argparse
from pathlib import Path
from datetime import datetime
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# NEW NAV  (matches homepage exactly, replaces whatever is in each page)
# ---------------------------------------------------------------------------
NEW_NAV = '''<nav style="background:#0d1b2e;padding:0 1.5rem;display:flex;align-items:center;justify-content:space-between;height:60px;position:sticky;top:0;z-index:100;">
  <a href="/" style="font-family:'Fraunces',serif;font-size:1.1rem;font-weight:400;color:white;text-decoration:none;display:flex;align-items:center;gap:10px;">
    <span style="width:26px;height:26px;border-radius:7px;background:#c9943a;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:#0d1b2e;">N</span>
    Navigator
  </a>
  <div style="display:flex;align-items:center;gap:1.5rem;">
    <a href="/iep/states/new-york/new-york-timeline/" style="font-size:0.875rem;color:rgba(255,255,255,0.65);text-decoration:none;">Timeline</a>
    <a href="/resources/" style="font-size:0.875rem;color:rgba(255,255,255,0.65);text-decoration:none;">Resources</a>
    <a href="/iep/states/new-york/districts/" style="font-size:0.875rem;color:rgba(255,255,255,0.65);text-decoration:none;">All districts</a>
    <a href="/app/" style="font-size:0.875rem;font-weight:500;background:#c9943a;color:#0d1b2e;padding:7px 18px;border-radius:8px;text-decoration:none;">Start free</a>
  </div>
</nav>'''


# ---------------------------------------------------------------------------
# NEW FOOTER  (replaces the old Navigator Kids AI footer entirely)
# ---------------------------------------------------------------------------
NEW_FOOTER = '''<footer style="background:#080f1a;padding:52px 24px 28px;border-top:1px solid rgba(255,255,255,0.05);">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:3rem;margin-bottom:3rem;">

      <div>
        <a href="/" style="display:flex;align-items:center;gap:10px;text-decoration:none;margin-bottom:14px;">
          <span style="width:28px;height:28px;border-radius:8px;background:#c9943a;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#0d1b2e;flex-shrink:0;">N</span>
          <span style="font-family:\'Fraunces\',serif;font-size:1.15rem;color:rgba(255,255,255,0.85);">Navigator</span>
        </a>
        <p style="font-size:0.85rem;color:rgba(255,255,255,0.35);line-height:1.65;max-width:260px;">The IEP companion built for New York families. Know your rights. Track your deadlines. Document everything.</p>
      </div>

      <div>
        <div style="font-size:0.72rem;font-weight:600;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">App</div>
        <div style="display:flex;flex-direction:column;gap:9px;">
          <a href="/iep/states/new-york/new-york-timeline/" style="font-size:0.85rem;color:rgba(255,255,255,0.4);text-decoration:none;">CSE timeline</a>
          <a href="/app/" style="font-size:0.85rem;color:rgba(255,255,255,0.4);text-decoration:none;">Letter generator</a>
          <a href="/app/" style="font-size:0.85rem;color:rgba(255,255,255,0.4);text-decoration:none;">Service log</a>
          <a href="/pricing/" style="font-size:0.85rem;color:rgba(255,255,255,0.4);text-decoration:none;">Pricing</a>
        </div>
      </div>

      <div>
        <div style="font-size:0.72rem;font-weight:600;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">Districts</div>
        <div style="display:flex;flex-direction:column;gap:9px;">
          <a href="/iep/states/new-york/districts/" style="font-size:0.85rem;color:rgba(255,255,255,0.4);text-decoration:none;">All NYC districts</a>
          <a href="/iep/states/new-york/" style="font-size:0.85rem;color:rgba(255,255,255,0.4);text-decoration:none;">NY IEP overview</a>
          <a href="https://newyorkspecialed.net/" style="font-size:0.85rem;color:rgba(255,255,255,0.4);text-decoration:none;">newyorkspecialed.net</a>
          <a href="/resources/" style="font-size:0.85rem;color:rgba(255,255,255,0.4);text-decoration:none;">Resources</a>
        </div>
      </div>

      <div>
        <div style="font-size:0.72rem;font-weight:600;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">Company</div>
        <div style="display:flex;flex-direction:column;gap:9px;">
          <a href="/about/" style="font-size:0.85rem;color:rgba(255,255,255,0.4);text-decoration:none;">About</a>
          <a href="/contact/" style="font-size:0.85rem;color:rgba(255,255,255,0.4);text-decoration:none;">Contact</a>
          <a href="/privacy/" style="font-size:0.85rem;color:rgba(255,255,255,0.4);text-decoration:none;">Privacy policy</a>
          <a href="/terms/" style="font-size:0.85rem;color:rgba(255,255,255,0.4);text-decoration:none;">Terms of service</a>
        </div>
      </div>

    </div>

    <div style="border-top:1px solid rgba(255,255,255,0.05);padding-top:22px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
      <span style="font-size:0.78rem;color:rgba(255,255,255,0.2);">© 2026 Navigator. Not legal advice.</span>
      <span style="font-size:0.78rem;color:rgba(255,255,255,0.2);">Built for New York families</span>
    </div>
  </div>
</footer>'''

# ---------------------------------------------------------------------------
# CTA BLOCK  (appended before </body>)
# ---------------------------------------------------------------------------
def make_cta_block(district_label, district_num):
    """Generate a district-specific CTA block."""
    num_str = f"District {district_num}" if district_num else district_label
    return f'''
<section style="background:#0d1b2e;padding:60px 24px;text-align:center;margin-top:0;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="font-size:0.78rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#c9943a;margin-bottom:12px;">{num_str} families</div>
    <h2 style="font-family:'Fraunces',serif;font-size:clamp(1.6rem,3.5vw,2.2rem);font-weight:400;color:white;margin-bottom:14px;line-height:1.2;">Track your {num_str} CSE deadlines — so nothing slips through</h2>
    <p style="color:rgba(255,255,255,0.55);font-size:1rem;margin-bottom:28px;line-height:1.7;">Navigator is free for {num_str} families. Enter your referral date and see every NY-mandated deadline on a live timeline. Log missed services. Generate letters when the district doesn't follow through.</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <a href="/app/?district={district_num or ''}" style="background:#c9943a;color:#0d1b2e;padding:13px 26px;border-radius:10px;font-size:0.95rem;font-weight:600;text-decoration:none;">Start tracking — it's free</a>
      <a href="/iep/states/new-york/new-york-timeline/" style="background:transparent;color:rgba(255,255,255,0.75);padding:13px 22px;border-radius:10px;font-size:0.95rem;text-decoration:none;border:1px solid rgba(255,255,255,0.2);">See the CSE timeline</a>
    </div>
    <p style="color:rgba(255,255,255,0.3);font-size:0.78rem;margin-top:16px;">No credit card &nbsp;·&nbsp; Built for NY law &nbsp;·&nbsp; All 32 NYC districts covered</p>
  </div>
</section>'''

# ---------------------------------------------------------------------------
# FONT INJECTION  (ensures Fraunces + Outfit are loaded)
# ---------------------------------------------------------------------------
FONT_LINK = '<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;1,9..144,300&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet">'

# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------
DISTRICTS = {
    "district-02": ("District 2",  "2",  "Upper East Side / Gramercy"),
    "district-03": ("District 3",  "3",  "Upper West Side / Harlem"),
    "district-06": ("District 6",  "6",  "Washington Heights / Inwood"),
    "district-07": ("District 7",  "7",  "South Bronx"),
    "district-08": ("District 8",  "8",  "Bronx"),
    "district-09": ("District 9",  "9",  "Bronx"),
    "district-10": ("District 10", "10", "Riverdale / Kingsbridge"),
    "district-11": ("District 11", "11", "Northeast Bronx"),
    "district-12": ("District 12", "12", "Bronx / Crotona Park"),
    "district-13": ("District 13", "13", "Bed-Stuy / Clinton Hill"),
    "district-14": ("District 14", "14", "Williamsburg / Greenpoint"),
    "district-15": ("District 15", "15", "Park Slope / Sunset Park"),
    "district-17": ("District 17", "17", "Crown Heights / East Flatbush"),
    "district-19": ("District 19", "19", "East New York / Starrett City"),
    "district-20": ("District 20", "20", "Bay Ridge / Borough Park"),
    "district-21": ("District 21", "21", "Coney Island / Bensonhurst"),
    "district-22": ("District 22", "22", "Flatbush / Sheepshead Bay"),
    "district-24": ("District 24", "24", "Jackson Heights / Elmhurst"),
    "district-25": ("District 25", "25", "Flushing / Whitestone"),
    "district-26": ("District 26", "26", "Bayside / Douglaston"),
    "district-27": ("District 27", "27", "Rockaways / Howard Beach"),
    "district-28": ("District 28", "28", "Forest Hills / Kew Gardens"),
    "district-29": ("District 29", "29", "Southeast Queens / Rosedale"),
    "district-30": ("District 30", "30", "Astoria / Long Island City"),
    "district-31": ("District 31", "31", "Staten Island"),
}

def remove_broken_maps(html: str) -> tuple[str, int]:
    """
    Remove the broken double-nested iframe map sections.

    Two patterns exist in the codebase:
    A)  <div class="rounded-xl overflow-hidden ...">
            <iframe ... allowfullscreen <iframe src="..."></iframe>
            </iframe>
        </div>
    B)  <div class="rounded-2xl ... aspect-video">
            <iframe ... <iframe src="..."></iframe> allowfullscreen>
            </iframe>
        </div>

    Strategy: find every <iframe that contains another <iframe src= and
    remove the entire nearest ancestor block-level container (div/section).
    """
    removed = 0

    # First pass: fix the malformed double-iframe into a clean single iframe
    # Pattern: outer <iframe tag ... <iframe src="URL" ...></iframe> ... >
    # We want to extract just the inner src and make one clean iframe.
    double_pattern = re.compile(
        r'<iframe[^>]*?<iframe\s+src="([^"]+)"[^>]*>',
        re.DOTALL | re.IGNORECASE
    )

    def replace_double_iframe(m):
        nonlocal removed
        removed += 1
        # Return nothing -- we remove the whole map block below
        return '<!-- MAP_REMOVED -->'

    html = double_pattern.sub(replace_double_iframe, html)

    # Remove orphaned closing </iframe> tags left behind
    html = re.sub(r'\s*</iframe>\s*</iframe>', '', html)
    html = re.sub(r'\s*</iframe>', '', html)

    # Remove the wrapper divs that held the maps + their caption <p> tags
    # These divs have classes like "rounded-xl overflow-hidden shadow-lg border-2 border-blue-100"
    # or "rounded-2xl overflow-hidden shadow-2xl border border-gray-100 mb-8 aspect-video"
    # Strategy: remove any <div> that contains our MAP_REMOVED marker
    # We do this with a simple regex since BeautifulSoup has trouble with malformed nesting

    # Remove wrapper div containing the map marker
    html = re.sub(
        r'<div[^>]*(?:rounded-xl|rounded-2xl)[^>]*overflow-hidden[^>]*>.*?<!-- MAP_REMOVED -->.*?</div>\s*',
        '',
        html,
        flags=re.DOTALL | re.IGNORECASE
    )

    # Clean up any stray map markers
    html = html.replace('<!-- MAP_REMOVED -->', '')

    # Also remove the italic caption paragraph that always follows the map
    # e.g. <p class="text-sm text-gray-500 text-center italic">Centering advocacy at PS...
    html = re.sub(
        r'<p[^>]*class="[^"]*text-sm[^"]*text-center[^"]*italic[^"]*"[^>]*>[^<]*P\.S\.[^<]*</p>',
        '',
        html,
        flags=re.IGNORECASE
    )
    html = re.sub(
        r'<p[^>]*class="[^"]*italic[^"]*text-center[^"]*"[^>]*>[^<]*(?:P\.S\.|school)[^<]*</p>',
        '',
        html,
        flags=re.IGNORECASE | re.DOTALL
    )

    return html, removed


def fix_nav(html: str) -> str:
    """Replace the entire <nav ...> block with the new homepage-matching nav."""
    # Match from opening <nav to closing </nav> (greedy-safe with DOTALL)
    html = re.sub(
        r'<nav\b.*?</nav>',
        NEW_NAV,
        html,
        count=1,
        flags=re.DOTALL | re.IGNORECASE
    )
    return html


def fix_fonts(html: str) -> str:
    """Ensure Fraunces + Outfit fonts are loaded; remove Merriweather/Inter references."""
    # Remove old Google Font link tags
    html = re.sub(
        r'<link[^>]+fonts\.googleapis\.com[^>]+(?:Merriweather|Inter)[^>]+>',
        '',
        html,
        flags=re.IGNORECASE
    )
    # Remove inline <style> blocks that only set Merriweather/Inter
    # These look like: <style>body{font-family:'Inter'...}h1,h2,h3{font-family:'Merriweather'...}</style>
    html = re.sub(
        r"<style>\s*(?:body|h[1-6])[^<]*(?:Merriweather|Inter)[^<]*</style>",
        '',
        html,
        flags=re.IGNORECASE | re.DOTALL
    )
    # Also strip any lingering font-family declarations referencing old fonts
    html = re.sub(
        r"font-family:\s*['\"]?(?:Merriweather|Inter)['\"]?[^;]*;",
        '',
        html,
        flags=re.IGNORECASE
    )
    # Add font link if not already in <head>
    # Must check <head> specifically — Fraunces can appear in body nav without being loaded
    head_end = html.lower().find('</head>')
    head_section = html[:head_end] if head_end != -1 else ''
    if 'Fraunces' not in head_section and 'fraunces' not in head_section:
        html = html.replace('</head>', f'{FONT_LINK}\n</head>', 1)
    return html


def fix_dead_links(html: str) -> str:
    """Update all dead/deprecated links site-wide."""
    replacements = [
        # Products -> pricing
        ('href="/products/"',                  'href="/pricing/"'),
        ('href="/products/#ai-prompts"',        'href="/pricing/"'),
        ('href="/products/#activity-packets"',  'href="/pricing/"'),
        # Cart -> app
        ('href="/cart/"',                       'href="/app/"'),
        # Bare states index -> NY
        ('href="/iep/states/"',                 'href="/iep/states/new-york/"'),
        # Quiz -> app (in nav button context)
        ('href="/quiz/" class="btn btn-primary nav-btn"', 'href="/app/" class="btn btn-primary nav-btn"'),
    ]
    for old, new in replacements:
        html = html.replace(old, new)
    return html


def fix_body_quiz_links(html: str) -> str:
    """Replace /quiz/ CTA buttons in the page body with /app/ equivalents.
    Only replaces styled buttons/links that are clearly CTAs, not inline text links."""
    # "Take the Advocacy Quiz" pink pill button -> app CTA
    html = re.sub(
        r'<a[^>]+href="/quiz/"[^>]*class="[^"]*(?:rounded-full|btn-primary|bg-pink)[^"]*"[^>]*>[^<]*(?:Quiz|quiz)[^<]*</a>',
        '<a href="/app/" style="display:inline-block;background:#c9943a;color:#0d1b2e;padding:12px 28px;border-radius:8px;font-weight:600;text-decoration:none;">Start free on Navigator</a>',
        html,
        flags=re.IGNORECASE
    )
    return html


def fix_placeholder_sections(html: str) -> str:
    """Replace "List Your Practice Here" sections with a real resource block."""
    # Check if the page has the placeholder resource section
    if 'List Your Practice Here' not in html:
        return html

    # Replace the entire "Hyperlocal Resources" section
    # Match from opening <section with bg-blue-900 to its closing </section>
    html = re.sub(
        r'<section[^>]*class="[^"]*bg-blue-900[^"]*"[^>]*>.*?</section>',
        _make_resources_section(),
        html,
        flags=re.DOTALL | re.IGNORECASE
    )
    return html


def _make_resources_section() -> str:
    return '''<section style="background:#f8f7f4;padding:60px 24px;border-top:1px solid rgba(13,27,46,0.08);">
  <div style="max-width:800px;margin:0 auto;">
    <div style="font-size:0.75rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#c9943a;margin-bottom:10px;text-align:center;">Tools for this district</div>
    <h2 style="font-family:'Fraunces',serif;font-size:1.8rem;font-weight:400;text-align:center;color:#0d1b2e;margin-bottom:40px;">Three things NY parents in this district need</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;">
      <div style="background:white;border:1px solid rgba(13,27,46,0.1);border-radius:12px;padding:24px;">
        <div style="font-size:1.4rem;margin-bottom:10px;">&#x1F4C5;</div>
        <h3 style="font-family:'Fraunces',serif;font-size:1.05rem;font-weight:400;margin-bottom:8px;">CSE Timeline Tracker</h3>
        <p style="font-size:0.85rem;color:#445870;margin-bottom:14px;line-height:1.5;">Track your 60-day evaluation window and every NY-mandated deadline automatically.</p>
        <a href="/iep/states/new-york/new-york-timeline/" style="font-size:0.8rem;font-weight:500;color:#c9943a;text-decoration:none;">Calculate my timeline</a>
      </div>
      <div style="background:white;border:1px solid rgba(13,27,46,0.1);border-radius:12px;padding:24px;">
        <div style="font-size:1.4rem;margin-bottom:10px;">&#x2709;&#xFE0F;</div>
        <h3 style="font-family:'Fraunces',serif;font-size:1.05rem;font-weight:400;margin-bottom:8px;">Letter Generator</h3>
        <p style="font-size:0.85rem;color:#445870;margin-bottom:14px;line-height:1.5;">AI-drafted letters citing NY law. Request evaluations, dispute PWNs, demand compensatory services.</p>
        <a href="/app/" style="font-size:0.8rem;font-weight:500;color:#c9943a;text-decoration:none;">Draft a letter</a>
      </div>
      <div style="background:white;border:1px solid rgba(13,27,46,0.1);border-radius:12px;padding:24px;">
        <div style="font-size:1.4rem;margin-bottom:10px;">&#x1F4CB;</div>
        <h3 style="font-family:'Fraunces',serif;font-size:1.05rem;font-weight:400;margin-bottom:8px;">Service Log</h3>
        <p style="font-size:0.85rem;color:#445870;margin-bottom:14px;line-height:1.5;">Document every missed session with a timestamped note. Build the evidence record before you need it.</p>
        <a href="/app/" style="font-size:0.8rem;font-weight:500;color:#c9943a;text-decoration:none;">Start logging</a>
      </div>
    </div>
  </div>
</section>'''


def fix_footer(html: str) -> str:
    """Replace the old Navigator Kids AI footer with the new one.

    Also fixes ordering: ensures the sequence is
      [page sections] -> [CTA] -> [footer] -> </body>
    The old footer uses Tailwind bg-[] syntax that doesn't work without CDN
    and contains stale branding / dead links.
    """
    # Remove the old footer entirely (match <footer ... </footer>)
    html = re.sub(
        r'<footer\b.*?</footer>',
        '',
        html,
        flags=re.DOTALL | re.IGNORECASE
    )
    return html


def fix_ordering(html: str, district_slug: str) -> str:
    """Ensure final page order is: content -> CTA -> footer -> </body>.

    After all other fixes run, this function collects any stray CTA and
    footer fragments and reassembles them in the correct order before </body>.
    """
    info = DISTRICTS.get(district_slug, ("this district", "", ""))
    label, num, _ = info
    cta = make_cta_block(label, num)

    # Strip any existing CTA section(s)
    html = re.sub(
        r'<section[^>]*style="[^"]*background:#0d1b2e[^"]*"[^>]*>.*?</section>',
        '',
        html,
        flags=re.DOTALL | re.IGNORECASE
    )
    # Strip any remaining old footer (in case fix_footer missed a variant)
    html = re.sub(r'<footer\b.*?</footer>', '', html, flags=re.DOTALL | re.IGNORECASE)

    # Clean up whitespace before </body>
    html = re.sub(r'\s*</body>', '\n</body>', html)

    # Reassemble: cta -> new footer -> </body>
    html = html.replace('</body>', cta + '\n' + NEW_FOOTER + '\n</body>', 1)
    return html


def add_cta_block(html: str, district_slug: str) -> str:
    """No-op — CTA placement is now handled by fix_ordering()."""
    return html


def process_file(path: Path, district_slug: str, dry_run: bool) -> dict:
    """Process a single district index.html. Returns a report dict."""
    original = path.read_text(encoding='utf-8', errors='replace')
    html = original

    html, maps_removed = remove_broken_maps(html)
    html = fix_nav(html)
    html = fix_fonts(html)
    html = fix_dead_links(html)
    html = fix_body_quiz_links(html)
    html = fix_placeholder_sections(html)
    html = fix_footer(html)
    html = fix_ordering(html, district_slug)  # always last — sets final CTA + footer + </body>

    changed = html != original
    report = {
        'path': str(path),
        'district': district_slug,
        'maps_removed': maps_removed,
        'placeholders_fixed': 'List Your Practice Here' not in html and 'List Your Practice Here' in original,
        'changed': changed,
        'written': False,
    }

    if changed and not dry_run:
        # Backup original
        backup = path.with_suffix('.html.bak')
        shutil.copy2(path, backup)
        path.write_text(html, encoding='utf-8')
        report['written'] = True

    return report


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description='Fix NY district pages')
    parser.add_argument('--root', default='.', help='Repo root (default: .)')
    parser.add_argument('--dry-run', action='store_true', dest='dry_run',
                        help='Preview changes without writing files')
    parser.add_argument('--execute', action='store_true',
                        help='Write changes to disk')
    args = parser.parse_args()

    dry_run = not args.execute  # default is dry run

    root = Path(args.root).resolve()
    districts_dir = root / 'iep' / 'states' / 'new-york' / 'districts'

    if not districts_dir.exists():
        print(f'[!] Districts directory not found: {districts_dir}')
        print('    Run from your repo root, e.g.: python fix_district_pages.py --root .')
        sys.exit(1)

    print(f'\n{"="*60}')
    print(f'  Navigator — District Page Fixer')
    print(f'  {"DRY RUN — no files will be changed" if dry_run else "EXECUTE MODE — files will be updated"}')
    print(f'  Root: {root}')
    print(f'  Districts dir: {districts_dir}')
    print(f'{"="*60}\n')

    # Find all district folders
    target_dirs = sorted([
        d for d in districts_dir.iterdir()
        if d.is_dir() and (d / 'index.html').exists()
        and d.name in DISTRICTS
    ])

    if not target_dirs:
        print('[!] No district folders with index.html found.')
        print('    Make sure --root points to the repo root that contains iep/states/new-york/districts/')
        sys.exit(1)

    print(f'Found {len(target_dirs)} district pages to process:\n')

    reports = []
    total_maps = 0

    for d in target_dirs:
        slug = d.name
        fp = d / 'index.html'
        label, num, neighborhoods = DISTRICTS[slug]
        report = process_file(fp, slug, dry_run)
        reports.append(report)
        total_maps += report['maps_removed']

        status = '[WRITE]' if report['written'] else ('[WOULD WRITE]' if report['changed'] else '[no change]')
        notes = []
        if report["maps_removed"]:    notes.append(f'{report["maps_removed"]} map(s) removed')
        if report["placeholders_fixed"]: notes.append('placeholder sections fixed')
        note_str = ('  ' + ', '.join(notes)) if notes else ''
        print(f'  {status:<16} {label} ({neighborhoods}){note_str}')

    print(f'\n{"="*60}')
    print(f'  Summary')
    print(f'{"="*60}')
    print(f'  Pages processed : {len(reports)}')
    print(f'  Pages changed   : {sum(1 for r in reports if r["changed"])}')
    print(f'  Maps removed    : {total_maps}')
    print(f'  Files written   : {sum(1 for r in reports if r["written"])}')
    if dry_run:
        print(f'\n  [i] Dry run -- run with --execute to apply changes')
        print(f'      Backups (.html.bak) will be created automatically\n')
    else:
        print(f'\n  [OK] Done. Originals backed up as .html.bak\n')


if __name__ == '__main__':
    main()