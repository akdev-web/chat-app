import React from 'react'
// GoogleLoginButton.jsx
const GOOGLE_CLIENT_ID = "470482245813-qg8m6gunuj58kujli931hj46npcfo8sk.apps.googleusercontent.com";

const redirectUri = encodeURIComponent("http://localhost:3000/auth/google/callback");
const scope = encodeURIComponent("openid email profile");

const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;


const GoogleSignin = () => {
  return (
    <a href={googleAuthUrl}>
      <button className="px-4 py-2 bg-gray-800 text-white rounded-md">
        Sign in with Google
      </button>
    </a>
  );
}

export default GoogleSignin
