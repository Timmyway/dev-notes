import { useState } from "react";

export default function Login({ onLogin }) {
  const [token, setToken] = useState("");

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-100">
      <div className="bg-gray-800 p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Enter API Token</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin(token);
          }}
          className="flex flex-col"
        >
          {/* hidden username for browser/password manager */}
          <input
            type="text"
            name="username"
            autoComplete="username"
            style={{ display: "none" }}
          />

          <input
            type="password"
            className="w-full px-3 py-2 mb-4 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
            placeholder="Your API token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="new-password"
          />

          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
