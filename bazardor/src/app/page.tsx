
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id?: string | number;
  _id?: string;
  slug?: string;
  nameBn?: string;
  name?: string;
  title?: string;
  image?: string;
  emoji?: string;
  categoryIcon?: string;
  category?: string;
  categoryNameBn?: string;
  categoryName?: string;
  categorySlug?: string;
  unit?: string;
  today?: number | string;
  yesterday?: number | string;
  lastWeek?: number | string;
  lastMonth?: number | string;
  price?: number | string;
  currentPrice?: number | string;
  averagePrice?: number | string;
  avgPrice?: number | string;
  minPrice?: number | string;
  maxPrice?: number | string;
  change?: {
    dir?: "up" | "down" | string;
    pct?: number | string;
  } | number | string;
  priceChange?: number | string;
  [key: string]: unknown;
};

const API_URL = "https://api.api-store.workers.dev/api/bazardor";

const categories = [
  { icon: "🍚", name: "চাল", slug: "chal" },
  { icon: "🫘", name: "ডাল", slug: "dal" },
  { icon: "🧴", name: "তেল", slug: "tel" },
  { icon: "🥬", name: "সবজি", slug: "sobji" },
  { icon: "🐟", name: "মাছ", slug: "mach" },
  { icon: "🍗", name: "মাংস", slug: "mangsho" },
  { icon: "🥚", name: "ডিম-দুধ", slug: "dim-dudh" },
  { icon: "🌶️", name: "মসলা", slug: "mosla" },
];

function getList(data: unknown): Product[] {
  if (Array.isArray(data)) {
    return data as Product[];
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const obj = data as Record<string, unknown>;

  for (const key of ["data", "products", "items", "results"]) {
    const value = obj[key];

    if (Array.isArray(value)) {
      return value as Product[];
    }

    if (value && typeof value === "object") {
      const nested = value as Record<string, unknown>;

      for (const nestedKey of [
        "products",
        "items",
        "results",
      ]) {
        if (Array.isArray(nested[nestedKey])) {
          return nested[nestedKey] as Product[];
        }
      }
    }
  }

  return [];
}

function nameOf(product: Product): string {
  return String(
    product.nameBn ??
      product.name ??
      product.title ??
      "পণ্যের নাম"
  );
}

function priceOf(product: Product): number {
  const candidates = [
    product.today,
    product.averagePrice,
    product.avgPrice,
    product.currentPrice,
    product.price,
  ];

  for (const candidate of candidates) {
    if (
      typeof candidate === "number" &&
      Number.isFinite(candidate)
    ) {
      return candidate;
    }

    if (
      typeof candidate === "string" &&
      candidate.trim() !== ""
    ) {
      const parsed = Number(
        candidate.replace(/[,\s৳টাকা]/g, "")
      );

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
}

function changeDirection(product: Product): string {
  if (
    product.change &&
    typeof product.change === "object"
  ) {
    return String(product.change.dir ?? "flat");
  }

  const amount = Number(
    product.change ?? product.priceChange ?? 0
  );

  if (amount > 0) return "up";
  if (amount < 0) return "down";

  return "flat";
}

function changeOf(product: Product): number {
  if (
    product.change &&
    typeof product.change === "object"
  ) {
    const amount = Number(product.change.pct ?? 0);

    if (!Number.isFinite(amount)) return 0;

    return changeDirection(product) === "down"
      ? -Math.abs(amount)
      : Math.abs(amount);
  }

  const amount = Number(
    product.change ?? product.priceChange ?? 0
  );

  return Number.isFinite(amount) ? amount : 0;
}

function unitOf(product: Product): string {
  const rawUnit = String(product.unit ?? "").trim();

  if (!rawUnit) return "প্রতি একক";

  const units: Record<string, string> = {
    kg: "কেজি",
    kilogram: "কেজি",
    liter: "লিটার",
    litre: "লিটার",
    dozen: "ডজন",
    piece: "পিস",
    pieces: "পিস",
    pcs: "পিস",
  };

  const unit = units[rawUnit.toLowerCase()] ?? rawUnit;

  return unit.startsWith("প্রতি ")
    ? unit
    : `প্রতি ${unit}`;
}

function idOf(product: Product, index: number): string {
  return String(product.id ?? product._id ?? product.slug ?? index + 1);
}

function iconOf(product: Product): string {
  const value =
    product.emoji ??
    product.categoryIcon ??
    product.image;

  // Image URL থাকলে সেটিকে emoji হিসেবে দেখানো হবে না।
  if (
    typeof value === "string" &&
    value.trim() !== "" &&
    !/^https?:\/\//i.test(value)
  ) {
    return value;
  }

  return "🛒";
}

function money(value: number): string {
  return value.toLocaleString("bn-BD", {
    maximumFractionDigits: 2,
  });
}

function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const change = changeOf(product);
  const direction = changeDirection(product);
  const productId = idOf(product, index);

  return (
    <Link
      href={`/product/${encodeURIComponent(productId)}`}
      className="product-card"
    >
      <div className="product-top">
        <div className="product-icon">{iconOf(product)}</div>

        <div className="product-heading">
          <h3>{nameOf(product)}</h3>
          <p>{unitOf(product)}</p>
        </div>
      </div>

      <div className="price-row">
        <div>
          <p className="price-label">আজকের দাম</p>
          <p className="price-value">
            {money(priceOf(product))} টাকা
          </p>
        </div>

        <span
          className={`change-badge ${
            direction === "up"
              ? "change-up"
              : direction === "down"
                ? "change-down"
                : "change-flat"
          }`}
        >
          {direction === "up"
            ? "▲"
            : direction === "down"
              ? "▼"
              : "—"}{" "}
          {money(Math.abs(change))}%
        </span>
      </div>
    </Link>
  );
}

function Section({
  title,
  products,
  type,
}: {
  title: string;
  products: Product[];
  type: "up" | "down" | "all";
}) {
  return (
    <section className="page-section">
      <h2 className="section-title">
        {type === "up" && <span className="green">▲ </span>}
        {type === "down" && <span className="red">▼ </span>}
        {title}
      </h2>

      {products.length > 0 ? (
        <div className="product-grid">
          {products.map((product, index) => (
            <ProductCard
              key={idOf(product, index)}
              product={product}
              index={index}
            />
          ))}
        </div>
      ) : (
        <p className="empty-message">
          এই মুহূর্তে পণ্যের তথ্য পাওয়া যায়নি।
        </p>
      )}
    </section>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("default");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/products`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const json: unknown = await response.json();
        const list = getList(json);

        if (list.length === 0) {
          console.error("Unexpected API response:", json);
          throw new Error(
            "API response থেকে product list পাওয়া যায়নি।"
          );
        }

        if (active) {
          setProducts(list);
        }
      } catch (err) {
        console.error("Product loading failed:", err);

        if (active) {
          setError(
            "পণ্যের তথ্য লোড করা যায়নি। API response ও ইন্টারনেট পরীক্ষা করো।"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const rising = useMemo(
    () =>
      [...products]
        .filter((product) => changeDirection(product) === "up")
        .sort(
          (a, b) =>
            Math.abs(changeOf(b)) - Math.abs(changeOf(a))
        )
        .slice(0, 6),
    [products]
  );

  const falling = useMemo(
    () =>
      [...products]
        .filter((product) => changeDirection(product) === "down")
        .sort(
          (a, b) =>
            Math.abs(changeOf(b)) - Math.abs(changeOf(a))
        )
        .slice(0, 6),
    [products]
  );

  const sortedProducts = useMemo(() => {
    const list = [...products];

    if (sort === "asc") {
      list.sort((a, b) => priceOf(a) - priceOf(b));
    } else if (sort === "desc") {
      list.sort((a, b) => priceOf(b) - priceOf(a));
    }

    return list;
  }, [products, sort]);

  const today = new Intl.DateTimeFormat("bn-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date());

  const tickerProducts = products.length
    ? [...products, ...products]
    : [];

  return (
    <main>
      <header className="site-header">
        <div className="header-main">
          <Link href="/" className="brand">
            <span className="brand-icon">
              <Image
                src="/logo-icon.png"
                alt="বাজার দর লোগো"
                width={44}
                height={44}
                priority
              />
            </span>

            <span>
              <strong>বাজার দর</strong>
              <small>{today}</small>
            </span>
          </Link>

          <div className="auth-links">
            <Link href="/signin" className="signin-link">
              সাইন ইন
            </Link>
            <Link href="/signup" className="signup-link">
              সাইন আপ
            </Link>
          </div>
        </div>

        <nav
          className="category-nav"
          aria-label="পণ্যের ক্যাটাগরি"
        >
          {categories.map((category) => (
            <Link
              href={`/category/${category.slug}`}
              key={category.slug}
              className="category-link"
            >
              <span>{category.icon}</span>
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="ticker">
          {tickerProducts.length > 0 ? (
            <div className="ticker-track">
              {tickerProducts.map((product, index) => {
                const direction = changeDirection(product);
                const change = changeOf(product);
                const productId = idOf(product, index);

                return (
                  <Link
                    key={`${productId}-${index}`}
                    href={`/product/${encodeURIComponent(productId)}`}
                    className="ticker-item"
                  >
                    <span>{iconOf(product)}</span>
                    <span>{nameOf(product)}</span>
                    <span>
                      {money(priceOf(product))} টাকা/
                      {unitOf(product).replace("প্রতি ", "")}
                    </span>
                    <b
                      className={
                        direction === "up"
                          ? "green"
                          : direction === "down"
                            ? "red"
                            : ""
                      }
                    >
                      {direction === "up"
                        ? "▲"
                        : direction === "down"
                          ? "▼"
                          : "—"}{" "}
                      {money(Math.abs(change))}%
                    </b>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="ticker-placeholder">
              বাজারদরের তথ্য লোড হচ্ছে...
            </p>
          )}
        </div>
      </header>

      <div className="main-container">
        <section className="hero">
          <div className="hero-content">
            <span className="hero-date">{today}</span>

            <h1>আজকের বাজারের দাম এক নজরে</h1>

            <p>
              চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম —
              বাজারভিত্তিক বিস্তারিত, গড়, সর্বনিম্ন-সর্বোচ্চ এবং
              দামের পরিবর্তন এক জায়গায়।
            </p>

            <a href="#সব-পণ্য" className="hero-button">
              সব পণ্য দেখুন
            </a>
          </div>

          <div className="hero-image">
            <Image
              src="/bazar-hero.png"
              alt="বাজারের সবজির ঝুড়ি"
              width={500}
              height={400}
              priority
              className="hero-img"
            />
          </div>
        </section>

        {loading ? (
          <div className="loading-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="skeleton-card" key={index}>
                <div className="skeleton-line" />
                <div className="skeleton-line short" />
                <div className="skeleton-line" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : (
          <>
            <Section
              title="আজ দাম বেড়েছে"
              products={rising}
              type="up"
            />

            <Section
              title="আজ দাম কমেছে"
              products={falling}
              type="down"
            />

            <section
              id="সব-পণ্য"
              className="page-section all-products"
            >
              <div className="all-products-heading">
                <div>
                  <h2 className="section-title">সব পণ্য</h2>
                  <p className="section-subtitle">
                    মোট {money(products.length)}টি পণ্য দেখানো হচ্ছে
                  </p>
                </div>

                <label className="sort-control">
                  <span>সাজান</span>

                  <select
                    value={sort}
                    onChange={(event) =>
                      setSort(event.target.value)
                    }
                    aria-label="পণ্য সাজান"
                  >
                    <option value="default">ডিফল্ট</option>
                    <option value="asc">দাম: কম থেকে বেশি</option>
                    <option value="desc">দাম: বেশি থেকে কম</option>
                  </select>
                </label>
              </div>

              <div className="product-grid">
                {sortedProducts.map((product, index) => (
                  <ProductCard
                    key={idOf(product, index)}
                    product={product}
                    index={index}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      <footer className="site-footer">
        <p>বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে।</p>
        <p>
          সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে পরিবর্তিত হয়।
        </p>
      </footer>
    </main>
  );
}
