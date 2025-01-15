# AuthSentry

AuthSentry is a secure password and secret manager. It ensures security of all the sensitive data using AES-256 encryption algorithm. It uses Google Firebase as its cloud backend. It's written in React as a Single Page Application (SPA) with Progressive Web App (PWA) support.

## Data Security

AuthSentry encrypts and decrypts all the sensitive data in the client side using `AES-256-GCM` algorithm which is one of the most secured encryption algorithm. The encryption key is derrived from the `Master Password` and a `Secret` set by the user. The `Master Password` is the password for signing into the user account. The `Secret` is a value stored locally as an encrypted value. The `Secret` never leaves the user device. So, unless the user device is compromised, no one will be able to decrypt the data because the `Secret` will remain secret, even if someone finds a way to hack into the user account or access to the database.

If you forget the `Secret` or the `Master Password` there is no way to recover (decrypt) your data.

## Self Managed Solution

Anyone can self host and manage their own instance of AuthSentry using their own Firebase project with the free tier. It can be hosted anywhere.

## Firebase Project Setup

AuthSentry uses the following features from Firebase:

* Authentication
* Realtime Database
* Hosting (Optional)

**IMPORTANT**: If you are setting up your own Firebase project, Make sure to configure the rule for the Realtime Database!

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

For Authentication, add `Email/Password` provider in your Firebase project.

For hosting, you can use any hosting provider you want. I have tested the project with Firebase hosting and Github Pages. The project includes two github action for automated deployment to these two platforms.
