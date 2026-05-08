#!/usr/bin/env python3
"""AdSense Management API checker for crepika.com"""
import sys, os, json
sys.stdout.reconfigure(encoding='utf-8')
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

CLIENT_FILE = r'D:\env\adsense_oauth_client.json'
TOKEN_FILE  = r'D:\env\adsense_token.json'
SCOPES      = ['https://www.googleapis.com/auth/adsense.readonly']

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
        with open(TOKEN_FILE, 'w') as f:
            f.write(creds.to_json())
    return creds

def main():
    creds = get_credentials()
    service = build('adsense', 'v2', credentials=creds)

    # 1. List accounts
    print("\n=== AdSense Accounts ===")
    accounts = service.accounts().list().execute()
    for acct in accounts.get('accounts', []):
        print(f"  {acct['name']} | state: {acct.get('state')} | display: {acct.get('displayName')}")
        account_name = acct['name']  # e.g. accounts/pub-xxxxx

    if not accounts.get('accounts'):
        print("  No accounts found.")
        return

    account_name = accounts['accounts'][0]['name']
    print(f"\n[Using account: {account_name}]")

    # 2. Sites
    print("\n=== Sites ===")
    try:
        sites = service.accounts().sites().list(parent=account_name).execute()
        for site in sites.get('sites', []):
            print(f"  {site.get('domain')} | state: {site.get('state')} | autoAdsEnabled: {site.get('autoAdsEnabled')}")
    except Exception as e:
        print(f"  Sites error: {e}")

    # 3. Alerts (policy issues)
    print("\n=== Alerts (Policy / Issues) ===")
    try:
        alerts = service.accounts().alerts().list(parent=account_name).execute()
        for alert in alerts.get('alerts', []):
            print(f"  [{alert.get('severity')}] {alert.get('type')} — {alert.get('message')}")
        if not alerts.get('alerts'):
            print("  No alerts. Good!")
    except Exception as e:
        print(f"  Alerts error: {e}")

    # 4. Performance report (last 7 days)
    print("\n=== Last 7-day Performance ===")
    try:
        from datetime import date, timedelta
        end = date.today().isoformat()
        start = (date.today() - timedelta(days=7)).isoformat()
        report = service.accounts().reports().generate(
            account=account_name,
            dateRange='LAST_7_DAYS',
            metrics=['ESTIMATED_EARNINGS', 'PAGE_VIEWS', 'IMPRESSIONS', 'CLICKS', 'PAGE_VIEWS_RPM'],
        ).execute()
        row = report.get('totals', {}).get('cells', [])
        labels = ['Earnings', 'PageViews', 'Impressions', 'Clicks', 'RPM']
        for label, cell in zip(labels, row):
            print(f"  {label}: {cell.get('value', 'N/A')}")
    except Exception as e:
        print(f"  Report error: {e}")

    # 5. Ad clients (needed for ad units in v2)
    print("\n=== Ad Clients ===")
    try:
        adclients = service.accounts().adclients().list(parent=account_name).execute()
        for client in adclients.get('adClients', []):
            print(f"  {client.get('name')} | reporting: {client.get('reportingDimensionId')} | state: {client.get('state')}")
        if not adclients.get('adClients'):
            print("  No ad clients found.")
    except Exception as e:
        print(f"  Ad clients error: {e}")

    # 6. Ad units (via adclient)
    print("\n=== Ad Units ===")
    try:
        adclients = service.accounts().adclients().list(parent=account_name).execute()
        found_any = False
        for client in adclients.get('adClients', []):
            adclient_name = client.get('name')
            try:
                ad_units = service.accounts().adclients().adunits().list(parent=adclient_name).execute()
                for unit in ad_units.get('adUnits', []):
                    found_any = True
                    print(f"  {unit.get('displayName')} | state: {unit.get('state')} | type: {unit.get('contentAdsSettings', {}).get('type')}")
            except Exception:
                pass
        if not found_any:
            print("  No manual ad units (using auto-ads only)")
    except Exception as e:
        print(f"  Ad units error: {e}")

if __name__ == '__main__':
    main()
