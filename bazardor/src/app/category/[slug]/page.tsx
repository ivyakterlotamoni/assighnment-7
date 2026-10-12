
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Product = {
  id: number | string;
  slug?: string;
  nameBn: string;
  category?: string;
  categoryNameBn?: string;
  categoryIcon?: string;
  image?: string;
  unit?: string;
  today?: number;
  change?: {
    dir?: string;
    pct?: number;
  };
};

const API =
  "https://openapi.programming-hero.com/api/bazardor";

const categories: Record<string, string> = {
  chal: "চাল",
  dal: "ডাল",
  tel: "তেল",
  sobji: "সবজি",
  mach: "মাছ",
  mangsho: "মাংস",
  "dim-dui": "ডিম-দুধ",
  mosla: "মসলা",
};

function getProducts(json: unknown): Product[] {
  if (Array.isArray(json)) return json as Product[];

  if (json && typeof json === "object") {
    const obj = json as Record<string, unknown>;

    if (Array.isArray(obj.data)) {
      return obj.data as Product[];
    }
  }

  return [];
}

export default function CategoryPage() {
  const params = useParams();
  const slug = String(params.slug ?? "");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("default");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      setProducts([]);

      try {
        if (!categories[slug]) {
          throw new Error("INVALID_CATEGORY");
        }

        const response = await fetch(
          `${API}/products?category=${encodeURIComponent(slug)}`
        );

        if (!response.ok) {
          throw new Error("পণ্যের তথ্য আনা যায়নি।");
        }

        const json: unknown = await response.json();
        const list = getProducts(json);

        if (active) setProducts(list);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error &&
              err.message === "INVALID_CATEGORY"
              ? "এই ক্যাটাগরিটি পাওয়া যায়নি।"
              : "পণ্য লোড হয়নি। আবার চেষ্টা করো।"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [slug]);

  const sorted = [...products].sort((a, b) => {
    if (sort === "asc") {
      return Number(a.today ?? 0) - Number(b.today ?? 0);
    }

    if (sort === "desc") {
      return Number(b.today ?? 0) - Number(a.today ?? 0);
    }

    return 0;
  });

  return (
    <main className="min-h-screen bg-[#f5f7f3] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="mb-6 inline-block font-semibold text-green-800"
        >
          ← হোম পেজে ফিরে যাও
        </Link>

        <div className="mb-7 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-2 text-sm text-gray-500">
            বাজার দর / ক্যাটাগরি
          </p>

          <h1 className="text-3xl font-extrabold text-gray-900">
            {categories[slug] ?? "ক্যাটাগরি পাওয়া যায়নি"}
          </h1>

          <p className="mt-2 text-gray-600">
            এই ক্যাটাগরির পণ্যের বর্তমান বাজারদর দেখো।
          </p>
        </div>

        {!loading && !error && products.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-gray-600">
              মোট {products.length}টি পণ্য
            </p>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3"
              aria-label="দাম অনুযায়ী সাজাও"
            >
              <option value="default">ডিফল্ট</option>
              <option value="asc">দাম: কম থেকে বেশি</option>
              <option value="desc">দাম: বেশি থেকে কম</option>
            </select>
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl bg-white p-5 shadow-sm"
              >
                <div className="mb-4 h-5 w-2/3 rounded bg-gray-200" />
                <div className="h-4 w-1/3 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white p-8 text-center">
            <p className="text-red-600">{error}</p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-lg bg-green-800 px-5 py-3 font-bold text-white"
            >
              হোম পেজে যাও
            </Link>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center">
            <p className="text-gray-600">
              এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।
            </p>
            <Link
              href="/"
              className="mt-4 inline-block font-bold text-green-800"
            >
              অন্য পণ্য দেখো →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((product, index) => {
              const change = Number(product.change?.pct ?? 0);
              const id = product.id ?? product.slug ?? index;

              return (
                <Link
                  key={String(id)}
                  href={`/product/${encodeURIComponent(String(id))}`}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-green-50 text-4xl">
                      {product.image || product.categoryIcon || "🛒"}
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {product.nameBn}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {product.unit || "একক উল্লেখ নেই"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-500">
                        আজকের দাম
                      </p>
                      <p className="mt-1 text-xl font-extrabold text-green-800">
                        {product.today != null
                          ? `${product.today} টাকা`
                          : "দাম নেই"}
                      </p>
                    </div>

                    {change !== 0 && (
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-bold ${
                          change > 0
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {change > 0 ? "▲" : "▼"}{" "}
                        {Math.abs(change)}%
                      </span>
                    )}
                  </div>

                  <p className="mt-4 border-t border-gray-100 pt-3 text-sm font-semibold text-green-800">
                    বিস্তারিত দেখো →
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
