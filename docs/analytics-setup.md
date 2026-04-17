# Firebase analytics setup

This site uses Firebase only after `js/firebase-config.js` is filled in and enabled. Until then, the analytics module exits without network calls.

## What gets tracked

- A Firebase Anonymous Auth user is created for each browser profile.
- Every page load increments `analytics/site.totalVisits`.
- The first local visit for an anonymous user increments `analytics/site.uniqueVisitors`.
- Successful love-letter decrypts increment `analytics/site.loveLettersUnlocks`.
- Visitor docs live at `visitors/{uid}` and store only:
  - first path
  - last path
  - external referrer host
  - visit count
  - timestamps

The site does not store IP addresses, full referrer URLs, user agents, or plaintext love-letter data.

## Firebase console setup

1. Create a Firebase project.
2. Add a Web app for `notprsn.github.io`.
3. Copy the Web app config into `js/firebase-config.js`.
4. Set `firebaseAnalyticsOptions.enabled` to `true`.
5. Enable Authentication providers:
   - Anonymous
   - Google
6. In Authentication settings, add this authorized domain:

   ```text
   notprsn.github.io
   ```

7. Create a Cloud Firestore database.
8. Edit `firestore.rules` and replace:

   ```text
   REPLACE_WITH_YOUR_GOOGLE_ACCOUNT_EMAIL
   ```

   with the Google account that should be allowed to read private stats in the Firebase console.

9. Deploy the rules:

   ```sh
   firebase login
   firebase use --add
   firebase deploy --only firestore:rules
   ```

10. Commit and push the filled Firebase config and generated site files.

## Viewing stats

Stats are intentionally not shown on the public site. View them in Firebase Console under Firestore:

- `analytics/site`
- `visitors/{uid}`

Firestore rules allow reads only for the admin email configured in `firestore.rules`.

## Static-site limits

This is privacy-light analytics, not fraud-proof analytics. A determined technical visitor can still spam public write endpoints. The rules keep public reads closed and restrict writes to authenticated Firebase users, but perfect abuse prevention would require App Check, a server-side endpoint, or Cloud Functions.
