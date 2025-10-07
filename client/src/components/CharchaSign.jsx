import React from 'react'
const GOOGLE_CLIENT_ID = "470482245813-qg8m6gunuj58kujli931hj46npcfo8sk.apps.googleusercontent.com";

const redirectUri = encodeURIComponent("http://localhost:3000/auth/google/callback");
const scope = encodeURIComponent("openid email profile");

const charchaAuthUrl = `http://localhost:3000/oauth/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

const CharchaSign = () => {
  return (
    <a href={charchaAuthUrl}>
      <button className="px-4 py-2 bg-blue-600 text-white rounded">
        Sign in with Charcha
      </button>
    </a>
  )
}

export default CharchaSign