import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const Signin = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !password) {
      setError('Please enter a username and password.');
      return;
    }

    try {
      setLoading(true);

      // TODO: Replace this with your real backend signin URL
      const res = await axios.post('http://localhost:3000/api/auth/signin', {
        username,
        password,
      });


      if (res.status !== 200 && res.status !== 201) {
        throw new Error(res.data?.message || 'Signin failed. Please try again.');
      }

      const data=res.data
      // console.log(data);
      
      login(data.username,data.userID,data.token)
      setSuccess('Signed in successfully! Redirecting...');
      
      // Navigate to home page after successful signin
      navigate('/home');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full text-white font-Geist bg-[#0a0a0a] flex justify-center items-center
[background-image:radial-gradient(circle,_rgba(255,255,255,0.15)_1.5px,_transparent_1px)]
[background-size:18px_18px]
[background-position:0_0]">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-[#0a0a0a]">
        <h2 className="text-2xl font-semibold mb-6">
          Sign In
        </h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-900 border border-red-700 px-4 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md bg-green-900 border border-green-700 px-4 py-2 text-sm text-green-200">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-[#0a0a0a]/60 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full rounded-md border border-gray-600 px-3 py-2 text-[#0a0a0a]/60 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#0a0a0a]/60 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-md border text-[#0a0a0a]/60 border-gray-600 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer flex justify-center items-center  bg-[#0a0a0a] px-4 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg mt-6"
          >
            {loading ? 'Signing in...' : 'SIGNIN'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signin;
