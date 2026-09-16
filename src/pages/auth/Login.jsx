import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Brand */}
        <div className="text-center mb-4">
          <img
            src="/crm-logo.png"
            alt="CRM Platform Logo"
            style={{ width: 64, height: 64, borderRadius: 14, margin: '0 auto 12px', display: 'block', objectFit: 'contain' }}
          />
          <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--clr-navy)' }}>
            CRM Platform
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--clr-muted)', marginTop: 2 }}>
            Sign in to your account
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email */}
          <div className="mb-3">
            <label htmlFor="login-email" className="form-label">
              Email address
            </label>
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Email is required.',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address.',
                },
              }}
              render={({ field }) => (
                <input
                  {...field}
                  id="login-email"
                  type="email"
                  className={`form-control${errors.email ? ' is-invalid' : ''}`}
                  placeholder="you@company.com"
                  autoComplete="email"
                  autoFocus
                />
              )}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email.message}</div>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="login-password" className="form-label">
              Password
            </label>
            <Controller
              name="password"
              control={control}
              rules={{ required: 'Password is required.' }}
              render={({ field }) => (
                <input
                  {...field}
                  id="login-password"
                  type="password"
                  className={`form-control${errors.password ? ' is-invalid' : ''}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              )}
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password.message}</div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="login-submit"
            className="btn btn-navy w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
