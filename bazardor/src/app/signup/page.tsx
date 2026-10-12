
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("দুটি পাসওয়ার্ড মিলছে না।");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (result.error) {
        setMessage(
          result.error.message || "অ্যাকাউন্ট তৈরি করা যায়নি। আবার চেষ্টা করুন।"
        );
        return;
      }

      router.push("/signin");
      router.refresh();
    } catch {
      setMessage("সমস্যা হয়েছে। আবার চেষ্টা করুন।");
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
        setMessage(result.error.message || "লগইন করা যায়নি।");
      }
    } catch {
      setMessage("সোশ্যাল লগইনে সমস্যা হয়েছে।");
    } finally {
      setSocialLoading("");
    }
  }

  return (
    <main className="min-h-screen bg-[#f0f5f0] px-4 py-8 text-[#203126]">
      <div className="mx-auto mb-7 max-w-6xl overflow-hidden rounded-lg border border-[#dce5dc] bg-white py-2">
        <div className="flex w-max animate-[ticker_30s_linear_infinite] gap-8 whitespace-nowrap px-4 text-sm">
          <span>🥔 আলু — আজকের বাজারদর</span>
          <span>🧅 পেঁয়াজ — আজকের বাজারদর</span>
          <span>🍚 চাল — আজকের বাজারদর</span>
          <span>🐟 মাছ — আজকের বাজারদর</span>
          <span>🥚 ডিম — আজকের বাজারদর</span>
          <span>🥔 আলু — আজকের বাজারদর</span>
          <span>🧅 পেঁয়াজ — আজকের বাজারদর</span>
          <span>🍚 চাল — আজকের বাজারদর</span>
        </div>
      </div>

      <section className="mx-auto w-full max-w-[390px]">
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-bold sm:text-3xl">
            অ্যাকাউন্ট তৈরি করুন
          </h1>
          <p className="mt-2 text-sm text-[#6b786e]">
            বিনামূল্যে সাইন আপ করে বাজারদর দেখুন
          </p>
        </div>

        <form
          onSubmit={handleSignup}
          className="space-y-4 rounded-2xl border border-[#dce5dc] bg-white p-5 shadow-sm sm:p-6"
        >
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              নাম
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="আপনার পুরো নাম"
              className="w-full rounded-lg border border-[#d1d9d2] px-3 py-2.5 text-sm outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              ইমেইল
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-[#d1d9d2] px-3 py-2.5 text-sm outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              পাসওয়ার্ড
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="কমপক্ষে ৮ অক্ষর"
              className="w-full rounded-lg border border-[#d1d9d2] px-3 py-2.5 text-sm outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium">
              পাসওয়ার্ড নিশ্চিত করুন
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="পাসওয়ার্ড আবার লিখুন"
              className="w-full rounded-lg border border-[#d1d9d2] px-3 py-2.5 text-sm outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
            />
          </div>

          {message && (
            <p role="alert" className="text-sm text-red-600">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !!socialLoading}
            className="w-full rounded-lg bg-[#07883f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#066f34] disabled:opacity-60"
          >
            {loading ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}
          </button>

          <div className="flex items-center gap-3 text-xs text-[#89928b]">
            <span className="h-px flex-1 bg-[#dce5dc]" />
            অথবা
            <span className="h-px flex-1 bg-[#dce5dc]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={loading || !!socialLoading}
              onClick={() => handleSocialLogin("google")}
              className="rounded-lg border border-[#d1d9d2] px-2 py-2.5 text-sm hover:bg-[#f5f8f5] disabled:opacity-60"
            >
              {socialLoading === "google" ? "অপেক্ষা করুন..." : "🌐 Google"}
            </button>

            <button
              type="button"
              disabled={loading || !!socialLoading}
              onClick={() => handleSocialLogin("github")}
              className="rounded-lg border border-[#d1d9d2] px-2 py-2.5 text-sm hover:bg-[#f5f8f5] disabled:opacity-60"
            >
              {socialLoading === "github" ? "অপেক্ষা করুন..." : "◉ GitHub"}
            </button>
          </div>

          <p className="text-center text-sm text-[#6b786e]">
            আগে থেকেই অ্যাকাউন্ট আছে?{" "}
            <Link
              href="/signin"
              className="font-semibold text-[#07883f] hover:underline"
            >
              সাইন ইন
            </Link>
          </p>
        </form>

        <div className="mt-5 text-center">
          <Link
            href="/"
            className="text-sm text-[#6b786e] hover:text-green-800 hover:underline"
          >
            ← হোম পেজে ফিরে যান
          </Link>
        </div>
      </section>

      <style jsx global>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[ticker_30s_linear_infinite\\] {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
