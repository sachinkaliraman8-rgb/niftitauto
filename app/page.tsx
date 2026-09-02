import Link from "next/link";
import Header from "@/components/Header";
import Logo from "@/components/Logo";
import HeroChart from "@/components/HeroChart";
import ShowcaseChart from "@/components/ShowcaseChart";
import ScrollEffects from "@/components/ScrollEffects";
import { getActivePlans } from "@/lib/plans";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function Tick() {
  return (
    <svg className="tick" width="15" height="11" viewBox="0 0 15 11">
      <polyline
        points="1,5.5 5,9.5 14,1"
        fill="none"
        stroke="#00A870"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatPrice(planPriceInr: number, billingInterval: string) {
  const price = `₹${planPriceInr.toLocaleString("en-IN")}`;
  if (billingInterval === "monthly") return { price, suffix: "/month" };
  if (billingInterval === "yearly") return { price, suffix: "/year" };
  return { price, suffix: "" };
}

export default async function Home() {
  const plans = await getActivePlans();
  const configured = isSupabaseConfigured();

  return (
    <>
      <Header />

      <section className="hero">
        <div className="narrow">
          <h1>Your chart draws its own levels.</h1>
          <p className="lede">
            Support, resistance, and confirmed breakouts — found automatically, candle by candle.
          </p>
          <div className="hero-btns">
            <a href="#pricing" className="btn btn-fill">
              Start 7 days free
            </a>
            <a href="#showcase" className="btn btn-line">
              See it work
            </a>
          </div>
          <p className="hero-fine">For TradingView · NSE, indices, and crypto · any timeframe</p>
        </div>

        <div className="wrap">
          <div className="hero-stage">
            <HeroChart />
          </div>
        </div>
      </section>

      <section className="showcase" id="showcase">
        <div className="wrap sc-inner">
          <div className="sc-sticky">
            <div className="sc-panel">
              <ShowcaseChart />
            </div>
          </div>

          <div className="sc-steps">
            <div data-layer="L1" className="on">
              <div className="sc-eyebrow" style={{ color: "#00A870" }}>
                Levels
              </div>
              <h3>It finds the lines you would have drawn.</h3>
              <p>
                Every swing high and low gets tested against every other. Only the lines price
                has genuinely respected — three touches or more — stay on your chart.
              </p>
            </div>
            <div data-layer="L2">
              <div className="sc-eyebrow" style={{ color: "#E9A23B" }}>
                Breakouts
              </div>
              <h3>A break only counts once volume agrees.</h3>
              <p>
                The candle has to close past the line, and volume has to run above its own
                average. Wicks and thin moves never trigger a marker.
              </p>
            </div>
            <div data-layer="L3">
              <div className="sc-eyebrow" style={{ color: "#00A870" }}>
                Retests
              </div>
              <h3>Then it waits for the calmer entry.</h3>
              <p>
                After a break, price often returns to test the same level from the other side.
                Niftit marks that moment — usually a better price than the breakout candle.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="rv">
            <h2>Set it up once.</h2>
            <p className="sec-lede">After that it runs on every chart you open, on its own.</p>
          </div>
          <div className="steps rv">
            <div>
              <div className="stepno">01</div>
              <h3>Subscribe</h3>
              <p>Share your TradingView username at checkout. Access is granted within a few hours.</p>
            </div>
            <div>
              <div className="stepno">02</div>
              <h3>Add to a chart</h3>
              <p>Find it under Invite-only scripts in your indicators panel. One click.</p>
            </div>
            <div>
              <div className="stepno">03</div>
              <h3>That&rsquo;s it</h3>
              <p>Lines, markers, and the day&rsquo;s bias update themselves as new candles close.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" id="pricing" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="center rv">
            <h2>Pricing</h2>
            <p className="sec-lede">Seven days free. Cancel whenever — access ends with your billing period.</p>
          </div>

          {!configured && (
            <div className="setup-notice">
              Supabase isn&rsquo;t configured yet, so plans can&rsquo;t be loaded. Add your keys to{" "}
              <code>.env.local</code> and run <code>supabase/schema.sql</code> to see live pricing here.
            </div>
          )}

          {configured && plans.length === 0 && (
            <div className="setup-notice">
              No active plans yet. Create one from <code>/admin/plans</code>.
            </div>
          )}

          {plans.length > 0 && (
            <div className="plans rv">
              {plans.map((plan) => {
                const { price, suffix } = formatPrice(plan.price_inr, plan.billing_interval);
                return (
                  <div className={`plan${plan.is_featured ? " hi" : ""}`} key={plan.id}>
                    <div className="plan-top">
                      <span className="plan-name">{plan.name}</span>
                      {plan.is_featured && <span className="tag">Best value</span>}
                    </div>
                    <div className="price">
                      {price}
                      <em> {suffix}</em>
                    </div>
                    <div className="plan-sub">
                      {plan.billing_interval === "yearly"
                        ? `Works out to ₹${Math.round(plan.price_inr / 12).toLocaleString("en-IN")} a month`
                        : `Billed ${plan.billing_interval}`}
                    </div>
                    <ul>
                      {plan.features.map((feature) => (
                        <li key={feature}>
                          <Tick />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/checkout/${plan.id}`}
                      className={`btn ${plan.is_featured ? "btn-fill" : "btn-line"}`}
                    >
                      Start free trial
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="sec legal" style={{ padding: "74px 0" }}>
        <div className="wrap rv">
          <p>
            <strong>Plainly put:</strong> Niftit is a technical charting tool. It marks price
            levels and patterns on your own chart automatically. It is not investment advice, it
            makes no recommendation to buy or sell, and it promises no profit — a level that held
            before is no guarantee it holds again. Trading carries real risk of loss. Every
            decision stays yours.
          </p>
        </div>
      </section>

      <footer>
        <div className="wrap frow">
          <div className="mark">
            <Logo size={19} />
            Niftit
          </div>
          <div className="ffine">support@niftit.example · Not investment advice · © 2026</div>
        </div>
      </footer>

      <ScrollEffects />
    </>
  );
}
