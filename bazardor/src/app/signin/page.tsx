
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        setMessage(
          result.error.message || "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।"
        );
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setMessage("লগইন করা যায়নি। সার্ভার চালু আছে কি না দেখুন।");
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialLogin(provider: "google" | "github") {
    setMessage("");
    setSocialLoading(provider);

    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });

      if (result.error) {
        setMessage(result.error.message || "সোশ্যাল লগইন করা যায়নি।");
      }
    } catch {
      setMessage("সোশ্যাল লগইনে সমস্যা হয়েছে।");
    } finally {
      setSocialLoading("");
    }
  }

  return (
    <main className="bd-auth-page">
      <Link href="/" className="bd-auth-brand">
        🛒 বাজার দর
      </Link>

      <h1>আবার ফিরে আসুন</h1>
      <p className="bd-auth-subtitle">
        আপনার অ্যাকাউন্টে সাইন ইন করুন
      </p>

      <form className="bd-auth-card" onSubmit={handleSubmit}>
        <label htmlFor="email">ইমেইল</label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="password">পাসওয়ার্ড</label>
        <input
          id="password"
          type="password"
          placeholder="আপনার পাসওয়ার্ড"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <button className="bd-submit" type="submit" disabled={loading || !!socialLoading}>
          {loading ? "সাইন ইন হচ্ছে..." : "সাইন ইন"}
        </button>

        {message && (
          <p className="bd-form-message" role="alert" aria-live="polite">
            {message}
          </p>
        )}

        <div className="bd-or">
          <span>অথবা</span>
        </div>

        <button
          className="bd-social"
          type="button"
          disabled={loading || !!socialLoading}
          onClick={() => handleSocialLogin("google")}
        >
          {socialLoading === "google"
            ? "অপেক্ষা করুন..."
            : "🌐 Google দিয়ে চালিয়ে যান"}
        </button>

        <button
          className="bd-social"
          type="button"
          disabled={loading || !!socialLoading}
          onClick={() => handleSocialLogin("github")}
        >
          {socialLoading === "github"
            ? "অপেক্ষা করুন..."
            : "◉ GitHub দিয়ে চালিয়ে যান"}
        </button>

        <p className="bd-auth-footer">
          অ্যাকাউন্ট নেই?{" "}
          <Link href="/signup">সাইন আপ করুন</Link>
        </p>
      </form>
    </main>
  );
}
