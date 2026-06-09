#!/usr/bin/env python3
"""Read-only AdSense review status for crepika.com.

This intentionally reports only the current site's review readiness and
account-level alert summaries. It does not print revenue metrics, OAuth tokens,
client secrets, or other sites in the AdSense account.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from collections import Counter

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build


CLIENT_FILE = r"D:\env\adsense_oauth_client.json"
TOKEN_FILE = r"D:\env\adsense_token.json"
SCOPES = ["https://www.googleapis.com/auth/adsense.readonly"]
DEFAULT_DOMAIN = "crepika.com"
DEFAULT_PUBLISHER_ID = "pub-3050601904412736"


def get_credentials():
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, "w", encoding="utf-8") as handle:
            handle.write(creds.to_json())
    return creds


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--domain", default=DEFAULT_DOMAIN)
    parser.add_argument("--publisher-id", default=DEFAULT_PUBLISHER_ID)
    parser.add_argument("--strict", action="store_true")
    args = parser.parse_args()

    service = build("adsense", "v2", credentials=get_credentials())
    accounts = service.accounts().list().execute().get("accounts", [])
    account = next((item for item in accounts if item.get("name") == f"accounts/{args.publisher_id}"), None)
    if not account:
        result = {
            "ok": False,
            "domain": args.domain,
            "publisherId": args.publisher_id,
            "error": "publisher_account_not_found",
        }
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 2 if args.strict else 0

    account_name = account["name"]
    sites = service.accounts().sites().list(parent=account_name).execute().get("sites", [])
    site = next((item for item in sites if item.get("domain") == args.domain), None)

    alerts = service.accounts().alerts().list(parent=account_name).execute().get("alerts", [])
    severity_counts = Counter(alert.get("severity", "UNKNOWN") for alert in alerts)
    alert_types = sorted({alert.get("type", "unknown") for alert in alerts})

    adclients = service.accounts().adclients().list(parent=account_name).execute().get("adClients", [])
    publisher_client = next(
        (client for client in adclients if client.get("reportingDimensionId") == f"ca-{args.publisher_id}"),
        None,
    )

    result = {
        "ok": bool(site) and site.get("state") == "READY" and severity_counts.get("SEVERE", 0) == 0,
        "domain": args.domain,
        "publisherId": args.publisher_id,
        "account": {
            "name": account_name,
            "state": account.get("state"),
        },
        "site": {
            "found": bool(site),
            "state": site.get("state") if site else None,
            "autoAdsEnabled": site.get("autoAdsEnabled") if site else None,
        },
        "adClient": {
            "found": bool(publisher_client),
            "state": publisher_client.get("state") if publisher_client else None,
        },
        "alerts": {
            "total": len(alerts),
            "severityCounts": dict(sorted(severity_counts.items())),
            "types": alert_types,
        },
        "reviewBlockers": [
            blocker
            for blocker, blocked in [
                ("site_not_ready", not site or site.get("state") != "READY"),
                ("severe_account_alert", severity_counts.get("SEVERE", 0) > 0),
                ("publisher_ad_client_not_ready", not publisher_client or publisher_client.get("state") != "READY"),
            ]
            if blocked
        ],
    }

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 2 if args.strict and not result["ok"] else 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False, indent=2), file=sys.stderr)
        raise SystemExit(1)
