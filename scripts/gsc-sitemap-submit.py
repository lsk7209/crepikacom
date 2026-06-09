#!/usr/bin/env python3
"""Submit and verify the production sitemap in Google Search Console.

Uses a service account JSON from D:\env by default. The service account must be
added to the Search Console property with sufficient permission.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


SCOPES = ["https://www.googleapis.com/auth/webmasters"]
DEFAULT_CREDENTIALS = Path(r"D:\env\gsc_credentials.json")
DEFAULT_SITE = "https://crepika.com/"
DEFAULT_SITEMAP = "https://crepika.com/sitemap.xml"


def load_service(credentials_path: Path):
    credentials = service_account.Credentials.from_service_account_file(
        str(credentials_path),
        scopes=SCOPES,
    )
    return build("searchconsole", "v1", credentials=credentials)


def list_sites(service) -> list[str]:
    response = service.sites().list().execute()
    return [entry["siteUrl"] for entry in response.get("siteEntry", [])]


def choose_site(available_sites: list[str], requested_site: str) -> str:
    candidates = [
        requested_site,
        requested_site.rstrip("/"),
        "https://www.crepika.com/",
        "https://www.crepika.com",
        "https://crepika.com/",
        "https://crepika.com",
        "sc-domain:crepika.com",
    ]
    for candidate in candidates:
        if candidate in available_sites:
            return candidate
    raise RuntimeError(
        "No matching Search Console property found. Available properties: "
        + ", ".join(available_sites)
    )


def get_sitemap_status(service, site_url: str, sitemap_url: str) -> dict[str, Any]:
    return service.sitemaps().get(siteUrl=site_url, feedpath=sitemap_url).execute()


def success_like(status: dict[str, Any]) -> bool:
    errors = int(status.get("errors", 0) or 0)
    warnings = int(status.get("warnings", 0) or 0)
    is_pending = bool(status.get("isPending", False))
    return errors == 0 and warnings == 0 and not is_pending


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--credentials", default=str(DEFAULT_CREDENTIALS))
    parser.add_argument("--site", default=DEFAULT_SITE)
    parser.add_argument("--sitemap", default=DEFAULT_SITEMAP)
    parser.add_argument("--json", action="store_true", help="Print machine-readable JSON")
    args = parser.parse_args()

    credentials_path = Path(args.credentials)
    if not credentials_path.exists():
        raise FileNotFoundError(f"Credentials file not found: {credentials_path}")

    service = load_service(credentials_path)
    available_sites = list_sites(service)
    site_url = choose_site(available_sites, args.site)

    service.sitemaps().submit(siteUrl=site_url, feedpath=args.sitemap).execute()
    status = get_sitemap_status(service, site_url, args.sitemap)

    result = {
        "stack": "vite-react-static-spa",
        "site_property": site_url,
        "sitemap": args.sitemap,
        "submitted": True,
        "status": {
            "path": status.get("path"),
            "lastSubmitted": status.get("lastSubmitted"),
            "lastDownloaded": status.get("lastDownloaded"),
            "isPending": status.get("isPending", False),
            "isSitemapsIndex": status.get("isSitemapsIndex", False),
            "type": status.get("type"),
            "errors": int(status.get("errors", 0) or 0),
            "warnings": int(status.get("warnings", 0) or 0),
        },
        "success_like": success_like(status),
    }

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"Stack: {result['stack']}")
        print(f"Search Console property: {site_url}")
        print(f"Submitted sitemap: {args.sitemap}")
        print(f"Last submitted: {result['status']['lastSubmitted']}")
        print(f"Last downloaded: {result['status']['lastDownloaded']}")
        print(f"Pending: {result['status']['isPending']}")
        print(f"Errors: {result['status']['errors']}")
        print(f"Warnings: {result['status']['warnings']}")
        print(f"Success-like status: {result['success_like']}")

    return 0 if result["success_like"] else 2


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except HttpError as exc:
        print(exc, file=sys.stderr)
        raise SystemExit(1)
