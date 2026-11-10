# Turning on Google Drive sync

Hajime can save each course's progress backup to a hidden app-data folder in your own Google Drive, after a lesson (at most once a day), and restore it on a new phone. It is **off** until you paste an OAuth client id into `app/js/drive.js`. While the id is empty, nothing about Drive shows in the app and no Google script is loaded.

The app only asks for the `https://www.googleapis.com/auth/drive.appdata` scope: it can see only its own hidden folder, never your other Drive files. One file per course is stored (`hajime-backup-ja.json`, `hajime-backup-fr.json`, ...).

## Steps (about 10 minutes, free)

1. Go to <https://console.cloud.google.com/> and sign in with the Google account you will use for the backups.
2. Top bar, project picker, **New project**. Name it `Hajime`, then **Create**, and make sure it is selected.
3. **Enable the Drive API**: menu, *APIs & Services*, *Library*, search "Google Drive API", open it, **Enable**.
4. **OAuth consent screen**: menu, *APIs & Services*, *OAuth consent screen* (in newer consoles: *Google Auth Platform*, *Branding / Audience*).
   - User type: **External**. App name `Hajime`, your email as support and developer contact. Save.
   - Scopes: **Add or remove scopes**, tick `.../auth/drive.appdata` ("See, create, and delete its own configuration data in your Google Drive"), update, save.
   - Audience: leave the publishing status as **Testing**, and under **Test users** add your own Google account (and anyone else who will use sync). Testing mode is fine for personal use. Note: in testing mode Google asks you to sign in again about once a week; the app then asks again the next time you tap "Sync with Google Drive".
5. **Create the client id**: *APIs & Services*, *Credentials*, **Create credentials**, **OAuth client ID**.
   - Application type: **Web application**. Name `Hajime web`.
   - **Authorised JavaScript origins**: add `https://tedtomato.github.io` (no path, no trailing slash). For trying it locally you can also add `http://localhost:4173`.
   - Leave *Authorised redirect URIs* empty (the token client does not use one). **Create**.
   - Copy the **Client ID** (it looks like `1234567890-abc...apps.googleusercontent.com`). The client secret is not needed and must not be put in the app.
6. Open `app/js/drive.js` and paste the id:

   ```js
   export const DRIVE_CLIENT_ID = '1234567890-abc...apps.googleusercontent.com';
   ```

   A client id is public by design, it is fine to commit it.
7. Commit and push to `main`. When the new version is live, open the app, **Profile, Backup**: "Sync with Google Drive" is now there. Tap it, choose your account, accept the permission (Google shows an "unverified app" warning in testing mode: *Continue*). The first backup is saved straight away; "Last Drive sync" shows the time.
8. On a new phone: install the app, pick the same course, **Profile, Backup, Restore from Drive**.

## Good to know

- Sign-in expires after about an hour; the app asks Google for a new token when it needs one. If the quiet sign-in after a lesson is refused, nothing is shown; the next time you open Profile, Backup and tap sync or restore, Google's sign-in appears again.
- Turning sync off (Profile, Backup) only stops new uploads; the files stay in your Drive's hidden app folder. To remove them: Google Drive web, Settings, *Manage apps*, Hajime, *Delete hidden app data*.
- Errors (no connection, sign-in cancelled, Drive refusing) appear as a short message at the bottom of the screen.
